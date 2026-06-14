import { createDecipheriv, createHash } from 'crypto';

const deriveCtrKey = (rawKey: string): string =>
  createHash('sha512').update(rawKey).digest('hex').substring(0, 32);

// AES-CTR has no integrity tag, so a wrong key produces an arbitrary byte
// sequence instead of throwing. `OrThrow` reflects only the malformed-input
// failures from Node crypto (e.g. invalid base64).
export const decryptAesCtrOrThrow = ({
  ciphertext,
  rawKey,
}: {
  ciphertext: string;
  rawKey: string;
}): string => {
  const buffer = Buffer.from(ciphertext, 'base64');
  const iv = buffer.subarray(0, 16);
  const payload = buffer.subarray(16);
  const keyHash = deriveCtrKey(rawKey);
  const decipher = createDecipheriv('aes-256-ctr', keyHash, iv);

  return Buffer.concat([decipher.update(payload), decipher.final()]).toString();
};
