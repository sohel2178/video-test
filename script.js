const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};
const myPeer = new Peer();

const socket = io("https://sultantracker.com/");

let myStream = null;

console.log();

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myStream = stream;
    addVideoStream(myVideo, stream);
  })
  .catch((err) => console.log(err));

myPeer.on("open", (id) => {
  console.log(id, "In Peer Open");
  socket.emit("join-room", uuid.v4(), id);
});

myPeer.on("call", (call) => {
  console.log("Call Him");
  call.answer(myStream);

  const video = document.createElement("video");

  call.on("stream", (otherStream) => {
    addVideoStream(video, otherStream);
  });
});

socket.on("user-connected", (userId) => {
  console.log(userId);
  connectToNewUser(userId, myStream);
});

socket.on("user-disconnected", (userId) => {
  console.log("Dis Connect Call");
  if (peers[userId]) peers[userId].close();
});

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  videoGrid.append(video);
};

const connectToNewUser = (userId, stream) => {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (otherStream) => {
    console.log("Call Other Strem inside connectToNewUser");
    addVideoStream(video, otherStream);
  });

  call.on("close", () => {
    console.log("Call Close Call");
    video.remove();
  });

  peers[userId] = call;
};

// navigator.getUserMedia =
//   navigator.getUserMedia ||
//   navigator.webkitGetUserMedia ||
//   navigator.mozGetUserMedia ||
//   navigator.msGetUserMedia;

// function startVideo() {
//   navigator.getUserMedia(
//     { video: {} },
//     (stream) => {
//       console.log(stream);
//       video.srcObject = stream;
//     },
//     (err) => console.log(err)
//   );
// }

// startVideo();
