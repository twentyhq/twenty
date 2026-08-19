import { randomBytes } from 'crypto';

import { USER_SESSION_TOKEN_PREFIX } from 'src/engine/core-modules/user-session/constants/user-session-token-prefix.constant';

export const generateUserSessionToken = (): string => {
  return `${USER_SESSION_TOKEN_PREFIX}${randomBytes(32).toString('base64url')}`;
};
