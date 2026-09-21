import { isDefined } from 'twenty-shared/utils';

type AudioContextWindow = {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

// close() rejects on a context that never finished opening, and releasing one
// is never worth failing a start over.
const closeQuietly = async (audioContext: AudioContext): Promise<void> => {
  try {
    await audioContext.close();
  } catch {
    return;
  }
};

// iOS suspends any AudioContext created outside a user gesture, and a suspended
// context blocks the capture path speech recognition runs on. Failures are
// swallowed: this improves the odds of a clean start and is never the reason to
// refuse one.
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
    // See above: a failed unlock costs the odds of a clean start, nothing more.
  } finally {
    // Closed here rather than after resume(), because resume() rejecting is
    // exactly when the context would otherwise be leaked — and a rejection is
    // expected on the surface this exists for, where the gesture that permits
    // it can have expired during the microphone warm-up. A browser allows only
    // a handful of live contexts, each holding an audio render thread, so
    // leaking one per press would starve the capture path this is unlocking.
    if (isDefined(audioContext)) {
      await closeQuietly(audioContext);
    }
  }
};
