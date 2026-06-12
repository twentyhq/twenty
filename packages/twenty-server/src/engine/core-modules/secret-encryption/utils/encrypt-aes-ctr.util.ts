import { createCipheriv, createHash, randomBytes } from 'crypto';

const deriveCtrKey = (rawKey: string): string =>
  createHash('sha512').update(rawKey).digest('hex').substring(0, 32);

export const encryptAesCtr = ({
  plaintext,
  rawKey,
}: {
  plaintext: string;
  rawKey: string;
}): string => {
  const keyHash = deriveCtrKey(rawKey);
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-ctr', keyHash, iv);

  return Buffer.concat([iv, cipher.update(plaintext), cipher.final()]).toString(
    'base64',
  );
};
