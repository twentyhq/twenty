import { type Request } from 'express';
import { isNonEmptyString } from 'twenty-shared/utils';

import {
  USER_SESSION_COOKIE_NAME,
  USER_SESSION_SECURE_COOKIE_NAME,
} from 'src/engine/core-modules/user-session/constants/user-session-cookie.constants';
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

// Both names are read so sessions survive an http -> https topology change:
// the secure __Host- name is canonical whenever it is present.
export const extractUserSessionTokenFromRequestCookie = (
  request: Request,
): string | undefined => {
  const cookieHeader = request.headers.cookie;

  if (!isNonEmptyString(cookieHeader)) {
    return undefined;
  }

  const token =
    readCookieValue(cookieHeader, USER_SESSION_SECURE_COOKIE_NAME) ??
    readCookieValue(cookieHeader, USER_SESSION_COOKIE_NAME);

  if (!isNonEmptyString(token) || !isUserSessionToken(token)) {
    return undefined;
  }

  return token;
};
