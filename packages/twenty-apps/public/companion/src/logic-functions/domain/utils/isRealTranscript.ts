import { isArray } from '@sniptt/guards';

export const isRealTranscript = (transcript: unknown): boolean =>
  isArray(transcript) && transcript.length > 0;
