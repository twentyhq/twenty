import { createHash } from 'crypto';
import { createReadStream } from 'fs';

const SRI_ALGORITHM = 'sha512';

const toSriString = (digest: Buffer): string =>
  `${SRI_ALGORITHM}-${digest.toString('base64')}`;

export const computeSriIntegrity = (source: Buffer): string =>
  toSriString(createHash(SRI_ALGORITHM).update(source).digest());

export const computeFileSriIntegrity = async (
  filePath: string,
): Promise<string> => {
  const hash = createHash(SRI_ALGORITHM);

  for await (const chunk of createReadStream(filePath)) {
    hash.update(chunk);
  }

  return toSriString(hash.digest());
};
