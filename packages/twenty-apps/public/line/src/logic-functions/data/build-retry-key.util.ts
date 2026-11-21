import { createHash } from 'node:crypto';

// LINE requires a hex UUID and keeps it 24 hours, so a retried send with the same name is not delivered twice
export const buildRetryKey = (name: string): string => {
  const hash = createHash('sha1').update(name).digest().subarray(0, 16);

  hash.writeUInt8((hash.readUInt8(6) & 0x0f) | 0x50, 6);
  hash.writeUInt8((hash.readUInt8(8) & 0x3f) | 0x80, 8);

  const hex = hash.toString('hex');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
};
