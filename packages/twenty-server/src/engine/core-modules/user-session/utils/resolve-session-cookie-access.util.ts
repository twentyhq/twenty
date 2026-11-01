import { type Request } from 'express';
import { SESSION_COOKIE_OPT_IN_HEADER_NAME } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type SessionCookieAccess } from 'src/engine/core-modules/user-session/types/session-cookie-access.type';

// Opt-in so a new channel that makes the browser send cookies (e.g. front component host fetch) gets no session by default.
// Sec-Fetch-Mode is set by the browser and cannot be forged by page scripts; a navigation's response is never readable by them.
export const resolveSessionCookieAccess = (
  request: Request,
): SessionCookieAccess => {
  if (isDefined(request.headers[SESSION_COOKIE_OPT_IN_HEADER_NAME])) {
    return 'opted-in';
  }

  if (request.headers['sec-fetch-mode'] === 'navigate') {
    return 'navigation';
  }

  return 'denied';
};
