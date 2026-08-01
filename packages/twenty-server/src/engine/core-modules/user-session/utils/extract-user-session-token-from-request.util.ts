import { isNonEmptyString } from '@sniptt/guards';
import { type Request } from 'express';

import { USER_SESSION_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-cookie-name.constant';
import { USER_SESSION_SECURE_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-secure-cookie-name.constant';
import { isUserSessionToken } from 'src/engine/core-modules/user-session/utils/user-session-token.util';

const readCookieValue = (
  cookieHeader: string,
  cookieName: string,
): string | undefined => {
  for (const cookiePart of cookieHeader.split(';')) {
    const separatorIndex = cookiePart.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    if (cookiePart.slice(0, separatorIndex).trim() !== cookieName) {
      continue;
    }

    const value = cookiePart.slice(separatorIndex + 1).trim();

    if (isNonEmptyString(value)) {
      return value;
    }
  }

  return undefined;
};

// The plain name is only read on deployments that cannot set a __Host- cookie
// at all (plain http), because __Host- is precisely what stops a sibling
// subdomain from widening the cookie: accepting the plain name on an https
// deployment would let a subdomain toss a session in and fixate the visitor.
export const extractUserSessionTokenFromRequestCookie = (
  request: Request,
  { allowInsecureCookieName }: { allowInsecureCookieName: boolean },
): string | undefined => {
  const cookieHeader = request.headers.cookie;

  if (!isNonEmptyString(cookieHeader)) {
    return undefined;
  }

  const token =
    readCookieValue(cookieHeader, USER_SESSION_SECURE_COOKIE_NAME) ??
    (allowInsecureCookieName
      ? readCookieValue(cookieHeader, USER_SESSION_COOKIE_NAME)
      : undefined);

  if (!isNonEmptyString(token) || !isUserSessionToken(token)) {
    return undefined;
  }

  return token;
};
