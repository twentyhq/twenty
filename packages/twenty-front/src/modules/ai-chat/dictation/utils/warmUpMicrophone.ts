export const warmUpMicrophone = async (): Promise<void> => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  for (const track of stream.getTracks()) {
    track.stop();
  }
};
