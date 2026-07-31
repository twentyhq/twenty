import { createHash, randomBytes } from 'crypto';

// Prefix makes opaque session tokens self-describing so the bearer-token
// dispatcher can route them without attempting JWT verification first.
export const USER_SESSION_TOKEN_PREFIX = 'sess_';

export const generateUserSessionToken = (): string => {
  return `${USER_SESSION_TOKEN_PREFIX}${randomBytes(32).toString('base64url')}`;
};

export const isUserSessionToken = (token: string): boolean => {
  return token.startsWith(USER_SESSION_TOKEN_PREFIX);
};

export const hashUserSessionToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex');
};
