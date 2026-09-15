import { createHash } from 'crypto';

export const computeCallRecordingIdForFathomMeeting = (
  recordingId: number,
): string => {
  const bytes = createHash('sha256').update(`fathom:${recordingId}`).digest();

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hexadecimalValue = bytes.subarray(0, 16).toString('hex');

  return `${hexadecimalValue.slice(0, 8)}-${hexadecimalValue.slice(8, 12)}-${hexadecimalValue.slice(12, 16)}-${hexadecimalValue.slice(16, 20)}-${hexadecimalValue.slice(20)}`;
};
