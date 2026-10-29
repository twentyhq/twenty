import { type Request } from 'express';
import {
  FRONT_COMPONENT_HOST_FETCH_HEADER_NAME,
  SESSION_COOKIE_OPT_IN_HEADER_NAME,
} from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

export type SessionCookieAccess =
  | 'opted-in'
  | 'navigation'
  | 'legacy'
  | 'denied';

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

  // TODO(@FelixMalfait): bundles that predate the opt-in header; remove with twentyhq/core-team-issues#3126.
  if (!isDefined(request.headers[FRONT_COMPONENT_HOST_FETCH_HEADER_NAME])) {
    return 'legacy';
  }

  return 'denied';
};
