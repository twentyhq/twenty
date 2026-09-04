import { createHash } from 'crypto';

// One deterministic UUID per Graph transcript id keeps every import path
// (on-demand, backfill, delta) idempotent on the same CallRecording.
export const computeCallRecordingIdForTranscript = (
  transcriptId: string,
): string => {
  const bytes = createHash('sha256')
    .update(`teams-transcript:${transcriptId}`)
    .digest();

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hexadecimalValue = bytes.subarray(0, 16).toString('hex');

  return `${hexadecimalValue.slice(0, 8)}-${hexadecimalValue.slice(8, 12)}-${hexadecimalValue.slice(12, 16)}-${hexadecimalValue.slice(16, 20)}-${hexadecimalValue.slice(20)}`;
};
