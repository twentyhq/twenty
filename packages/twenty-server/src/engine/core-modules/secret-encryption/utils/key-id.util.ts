import { createHash } from 'crypto';

// 8-hex-char fingerprint of the raw encryption key. Embedded in the v2
// envelope so each row identifies which physical key encrypted it without
// trial-decrypting against every configured key.
export const computeKeyId = (rawKey: string): string =>
  createHash('sha256').update(rawKey).digest('hex').slice(0, 8);
