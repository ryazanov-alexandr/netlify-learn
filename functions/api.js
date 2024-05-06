const express = require("express");
const serverless = require("serverless-http");

const app = express();
const router = express.Router();

const http = require('http');
const server = http.createServer(app);

const io = require("socket.io")(server, {
    cors: '*',
    maxHttpBufferSize: 1e7
  });

app.get('/', (req, res) => {
    res.send('Hello')
})

const PORT = process.env.PORT || 8888;

server.listen(PORT, () => {
    console.log("start listenning "+ PORT);
})

let connectedUsers = []; 

io.on('connection', onConnected);

function onConnected(socket) {
    socket.on('connect user', (data) => {
        data.socketId = socket.id;
        connectedUsers.push(data);
        io.emit('connect user', connectedUsers);
    })

    socket.on('chat message', (data) => {
        socket.broadcast.emit('chat message', data);
    })

    socket.on('feedback', (data) => {
        socket.broadcast.emit('feedback', data);
    })

    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter(user => user.socketId != socket.id);
        io.emit('connect user', connectedUsers);
    })
}

app.use("/", router);

module.exports.handler = serverless(app);