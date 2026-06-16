import { createHash } from 'crypto';

// Same meeting key → same id: the primary key serializes concurrent creates.
export const computeCallRecordingIdForMeeting = (
  realMeetingKey: string,
): string => {
  const bytes = createHash('sha256').update(realMeetingKey).digest();

  // v4 version/variant bits so server-side UUID validation accepts the hash.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.subarray(0, 16).toString('hex');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
