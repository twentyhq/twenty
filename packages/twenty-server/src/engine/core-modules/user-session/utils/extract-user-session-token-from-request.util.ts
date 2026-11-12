import { isNonEmptyString } from '@sniptt/guards';
import { type Request } from 'express';

import { isUserSessionToken } from 'src/engine/core-modules/user-session/utils/is-user-session-token.util';
import { readCookieValue } from 'src/engine/core-modules/user-session/utils/read-cookie-value.util';

// Plain name only on plain http: on https a sibling subdomain could plant one and fixate the visitor.
export const extractUserSessionTokenFromRequestCookie = (
  request: Pick<Request, 'headers'>,
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
    readCookieValue({ cookieHeader, cookieName: secureCookieName }) ??
    (allowInsecureCookieName
      ? readCookieValue({ cookieHeader, cookieName: insecureCookieName })
      : undefined);

  if (!isNonEmptyString(token) || !isUserSessionToken(token)) {
    return undefined;
  }

  return token;
};
