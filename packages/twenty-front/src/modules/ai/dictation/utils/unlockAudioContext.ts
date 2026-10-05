import { isDefined } from 'twenty-shared/utils';

type AudioContextWindow = {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

// close() rejects on a context that never finished opening.
const closeQuietly = async (audioContext: AudioContext): Promise<void> => {
  try {
    await audioContext.close();
  } catch {
    return;
  }
};

// iOS suspends AudioContexts created outside a gesture, which blocks speech capture.
export const unlockAudioContext = async (): Promise<void> => {
  const audioContextWindow = window as unknown as AudioContextWindow;
  const AudioContextConstructor =
    audioContextWindow.AudioContext ?? audioContextWindow.webkitAudioContext;

  if (!isDefined(AudioContextConstructor)) {
    return;
  }

  let audioContext: AudioContext | undefined;

  try {
    audioContext = new AudioContextConstructor();

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
  } catch {
    // A failed unlock only lowers the odds of a clean start.
  } finally {
    // Closed in finally: resume() routinely rejects here (the gesture can expire during warm-up), and browsers allow only a few live contexts.
    if (isDefined(audioContext)) {
      await closeQuietly(audioContext);
    }
  }
};
