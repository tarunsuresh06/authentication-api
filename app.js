const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const bcrypt = require('bcrypt')

const dbPath = path.join(__dirname, "tarunsuresh.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const checkUsernameQuery = `
  SELECT username from users WHERE username= '${username}';
  `;

  const checkUser = await db.get(checkUsernameQuery);

  if (checkUser === null) {
    if (password.length < 6) {
      res.status(400);
      res.send("Password is too short");
    } else {

        const hashedPassword = await bcrypt.hash(password, 10); 
        const createUserQuery = `
          INSERT INTO users(username, password)
          VALUES (${username}, ${hashedPassword});
          `;

        const dbResponse = await db.run(createUserQuery);
        const userId = dbResponse.lastID;
        res.send({ userId: userId });
      }
  } else {
    res.status(400);
    res.send("User already exists");
  }
});
