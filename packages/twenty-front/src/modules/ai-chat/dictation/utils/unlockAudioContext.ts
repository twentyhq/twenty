import { isDefined } from 'twenty-shared/utils';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

const closeQuietly = async (audioContext: AudioContext): Promise<void> => {
  try {
    await audioContext.close();
  } catch {
    return;
  }
};

export const unlockAudioContext = async (): Promise<void> => {
  const AudioContextConstructor: typeof AudioContext | undefined =
    window.AudioContext ?? window.webkitAudioContext;

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
  } finally {
    if (isDefined(audioContext)) {
      await closeQuietly(audioContext);
    }
  }
};
