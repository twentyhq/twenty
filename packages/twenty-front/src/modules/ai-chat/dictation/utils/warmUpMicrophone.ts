// Briefly opening the microphone on the gesture makes iOS's first dictation work; WebKit otherwise returns nothing.
export const warmUpMicrophone = async (): Promise<void> => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  for (const track of stream.getTracks()) {
    track.stop();
  }
};
