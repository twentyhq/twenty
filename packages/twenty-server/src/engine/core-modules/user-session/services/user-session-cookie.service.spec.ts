import { type Request, type Response } from 'express';
import { IGNORE_SESSION_COOKIE_HEADER_NAME } from 'twenty-shared/constants';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';

const SESSION_COOKIES =
  '__Host-twenty-session=sess_user; __Host-twenty-impersonator-session=sess_impersonator';

const buildRequest = (headers: Record<string, string> = {}): Request =>
  ({ headers: { cookie: SESSION_COOKIES, ...headers } }) as unknown as Request;

const buildResponse = (request: Request): Response =>
  ({
    req: request,
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  }) as unknown as Response;

const IGNORED_REQUEST_HEADERS = { [IGNORE_SESSION_COOKIE_HEADER_NAME]: '' };

describe('UserSessionCookieService', () => {
  const userSessionCookieService = new UserSessionCookieService({
    get: (key: string) =>
      ({ SERVER_URL: 'https://crm.example.com', AUTH_COOKIE_SAME_SITE: 'lax' })[
        key
      ],
  } as unknown as TwentyConfigService);

  it('should read the session cookies of an unmarked request', () => {
    const request = buildRequest();

    expect(
      userSessionCookieService.extractSessionTokenFromRequest(request),
    ).toBe('sess_user');
    expect(
      userSessionCookieService.extractImpersonatorSessionTokenFromRequest(
        request,
      ),
    ).toBe('sess_impersonator');
    expect(userSessionCookieService.hasSessionCookie(request)).toBe(true);
  });

  it('should not read the session cookies of a request carrying the ignore header, whatever its value', () => {
    const request = buildRequest(IGNORED_REQUEST_HEADERS);

    expect(userSessionCookieService.isSessionCookieIgnored(request)).toBe(true);
    expect(
      userSessionCookieService.extractSessionTokenFromRequest(request),
    ).toBeUndefined();
    expect(
      userSessionCookieService.extractImpersonatorSessionTokenFromRequest(
        request,
      ),
    ).toBeUndefined();
    expect(userSessionCookieService.hasSessionCookie(request)).toBe(false);
  });

  it('should write session cookies on the response to an unmarked request', () => {
    const response = buildResponse(buildRequest());

    userSessionCookieService.attachSessionTokenToResponse(
      response,
      'sess_new',
      new Date(),
    );
    userSessionCookieService.attachImpersonatorSessionTokenToResponse(
      response,
      'sess_parked',
    );
    userSessionCookieService.clearSessionCookie(response);
    userSessionCookieService.clearImpersonatorSessionCookie(response);

    expect(response.cookie).toHaveBeenCalledTimes(2);
    expect(response.clearCookie).toHaveBeenCalledTimes(4);
  });

  it('should not set or clear session cookies on the response to a request carrying the ignore header', () => {
    const response = buildResponse(buildRequest(IGNORED_REQUEST_HEADERS));

    userSessionCookieService.attachSessionTokenToResponse(
      response,
      'sess_new',
      new Date(),
    );
    userSessionCookieService.attachImpersonatorSessionTokenToResponse(
      response,
      'sess_parked',
    );
    userSessionCookieService.clearSessionCookie(response);
    userSessionCookieService.clearImpersonatorSessionCookie(response);

    expect(response.cookie).not.toHaveBeenCalled();
    expect(response.clearCookie).not.toHaveBeenCalled();
  });
});
