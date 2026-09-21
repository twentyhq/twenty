// Opening and immediately releasing the microphone on the user's gesture is
// what makes the first dictation attempt work on iOS: WebKit otherwise starts
// recognition against an audio stack that is still initialising and returns no
// result at all. The tracks are stopped straight away — the warm-up exists for
// its side effect on the audio stack, not to hold a stream open.
export const warmUpMicrophone = async (): Promise<void> => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  for (const track of stream.getTracks()) {
    track.stop();
  }
};
