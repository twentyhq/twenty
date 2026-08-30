type AudioContextWindow = {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

// iOS suspends any AudioContext created outside a user gesture, and a suspended
// context blocks the capture path speech recognition runs on. Failures are
// swallowed: this improves the odds of a clean start and is never the reason to
// refuse one.
export const unlockAudioContext = async (): Promise<void> => {
  const audioContextWindow = window as unknown as AudioContextWindow;
  const AudioContextConstructor =
    audioContextWindow.AudioContext ?? audioContextWindow.webkitAudioContext;

  if (AudioContextConstructor === undefined) {
    return;
  }

  try {
    const audioContext = new AudioContextConstructor();

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    await audioContext.close();
  } catch {
    return;
  }
};
