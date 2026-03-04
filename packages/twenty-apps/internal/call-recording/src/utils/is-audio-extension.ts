import { AUDIO_EXTENSIONS } from 'src/constants/audio-extensions';

export const isAudioExtension = (extension: string): boolean =>
  AUDIO_EXTENSIONS.includes(extension.toLowerCase() as (typeof AUDIO_EXTENSIONS)[number]);
