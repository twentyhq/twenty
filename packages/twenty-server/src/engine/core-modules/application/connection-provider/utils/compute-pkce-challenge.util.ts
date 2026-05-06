import { createHash } from 'crypto';

import { base64UrlEncode } from 'twenty-shared/utils';

export const computePkceChallenge = (verifier: string): string =>
  base64UrlEncode(createHash('sha256').update(verifier).digest());
