import { createHash } from 'crypto';

export const hashUserSessionToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex');
};
