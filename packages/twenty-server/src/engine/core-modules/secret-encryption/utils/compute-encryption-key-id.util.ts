import { createHash } from 'crypto';

export const computeEncryptionKeyId = ({
  rawKey,
}: {
  rawKey: string;
}): string => createHash('sha256').update(rawKey).digest('hex').slice(0, 8);
