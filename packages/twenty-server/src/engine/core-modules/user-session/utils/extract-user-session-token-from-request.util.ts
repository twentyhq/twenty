import { isNonEmptyString } from '@sniptt/guards';
import { type Request } from 'express';

import { isUserSessionToken } from 'src/engine/core-modules/user-session/utils/is-user-session-token.util';

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
// at all (plain http). Accepting it on an https deployment would let a
// sibling subdomain toss a session in and fixate the visitor.
export const extractUserSessionTokenFromRequestCookie = (
  request: Request,
  {
    secureCookieName,
    insecureCookieName,
    allowInsecureCookieName,
  }: {
    secureCookieName: string;
    insecureCookieName: string;
    allowInsecureCookieName: boolean;
  },
): string | undefined => {
  const cookieHeader = request.headers.cookie;

  if (!isNonEmptyString(cookieHeader)) {
    return undefined;
  }

  const token =
    readCookieValue(cookieHeader, secureCookieName) ??
    (allowInsecureCookieName
      ? readCookieValue(cookieHeader, insecureCookieName)
      : undefined);

  if (!isNonEmptyString(token) || !isUserSessionToken(token)) {
    return undefined;
  }

  return token;
};
