import { createHash } from 'crypto';

export const SRI_ALGORITHM = 'sha512';

export const toSriString = (digest: Buffer): string =>
  `${SRI_ALGORITHM}-${digest.toString('base64')}`;

export const computeSriIntegrity = (source: Buffer): string =>
  toSriString(createHash(SRI_ALGORITHM).update(source).digest());
