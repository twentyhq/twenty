import { USER_SESSION_TOKEN_PREFIX } from 'src/engine/core-modules/user-session/constants/user-session-token-prefix.constant';

export const isUserSessionToken = (token: string): boolean => {
  return token.startsWith(USER_SESSION_TOKEN_PREFIX);
};
