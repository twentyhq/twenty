import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

// Legacy CTR format: base64( IV(16 bytes) || ciphertext ).
// Key is derived as the first 32 hex chars of sha512(rawKey).
// Kept for backward compatibility with rows already in the database; new
// writes should go through aes-gcm-v2 instead.

const deriveCtrKey = (rawKey: string): string =>
  createHash('sha512').update(rawKey).digest('hex').substring(0, 32);

export const encryptAesCtrV1 = (plaintext: string, rawKey: string): string => {
  const keyHash = deriveCtrKey(rawKey);
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-ctr', keyHash, iv);

  return Buffer.concat([iv, cipher.update(plaintext), cipher.final()]).toString(
    'base64',
  );
};

export const decryptAesCtrV1 = (ciphertext: string, rawKey: string): string => {
  const buffer = Buffer.from(ciphertext, 'base64');
  const iv = buffer.subarray(0, 16);
  const payload = buffer.subarray(16);
  const keyHash = deriveCtrKey(rawKey);
  const decipher = createDecipheriv('aes-256-ctr', keyHash, iv);

  return Buffer.concat([decipher.update(payload), decipher.final()]).toString();
};
