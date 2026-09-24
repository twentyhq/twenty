import { isNull } from '@sniptt/guards';

export const buildTranscriptFailureReason = (
  subCode: string | null,
): string => {
  return isNull(subCode) ? 'transcript_failed' : `transcript_failed:${subCode}`;
};
