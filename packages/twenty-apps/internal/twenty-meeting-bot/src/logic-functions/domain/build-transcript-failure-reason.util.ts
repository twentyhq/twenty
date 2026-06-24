import { isNull } from '@sniptt/guards';

export const buildTranscriptFailureReason = (subCode: string | null): string =>
  isNull(subCode) ? 'transcript_failed' : `transcript_failed:${subCode}`;
