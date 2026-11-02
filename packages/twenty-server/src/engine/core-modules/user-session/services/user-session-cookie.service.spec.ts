import { Test, type TestingModule } from '@nestjs/testing';

import { type Request, type Response } from 'express';
import { SESSION_COOKIE_OPT_IN_HEADER_NAME } from 'twenty-shared/constants';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';

const SESSION_COOKIE = '__Host-twenty-session=sess_abc';

const buildRequest = (headers: Record<string, string>): Request =>
  ({ headers: { cookie: SESSION_COOKIE, ...headers } }) as unknown as Request;

const buildResponse = (request: Request): Response =>
  ({
    req: request,
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  }) as unknown as Response;

describe('UserSessionCookieService', () => {
  let service: UserSessionCookieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserSessionCookieService,
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn((key: string) =>
              key === 'SERVER_URL' ? 'https://crm.example.com' : 'lax',
            ),
          },
        },
      ],
    }).compile();

    service = module.get(UserSessionCookieService);
  });

  it('should read the session cookie on opted-in requests', () => {
    const request = buildRequest({ [SESSION_COOKIE_OPT_IN_HEADER_NAME]: '1' });

    expect(service.extractSessionTokenFromRequest(request)).toBe('sess_abc');
    expect(service.hasSessionCookie(request)).toBe(true);
  });

  it('should read the session cookie on top-level navigations', () => {
    const request = buildRequest({ 'sec-fetch-mode': 'navigate' });

    expect(service.extractSessionTokenFromRequest(request)).toBe('sess_abc');
  });

  it('should ignore the session cookie on requests that neither opt in nor navigate', () => {
    const request = buildRequest({ 'sec-fetch-mode': 'cors' });

    expect(service.extractSessionTokenFromRequest(request)).toBeUndefined();
    expect(
      service.extractImpersonatorSessionTokenFromRequest(request),
    ).toBeUndefined();
    expect(service.hasSessionCookie(request)).toBe(false);
  });

  it('should not set or clear session cookies in response to requests that do not opt in', () => {
    const response = buildResponse(buildRequest({ 'sec-fetch-mode': 'cors' }));

    service.attachSessionTokenToResponse(
      response,
      'sess_attacker',
      new Date(Date.now() + 60_000),
    );
    service.attachImpersonatorSessionTokenToResponse(response, 'sess_abc');
    service.clearSessionCookie(response);
    service.clearImpersonatorSessionCookie(response);

    expect(response.cookie).not.toHaveBeenCalled();
    expect(response.clearCookie).not.toHaveBeenCalled();
  });

  it('should set the session cookie in response to opted-in requests', () => {
    const response = buildResponse(
      buildRequest({ [SESSION_COOKIE_OPT_IN_HEADER_NAME]: '1' }),
    );

    service.attachSessionTokenToResponse(
      response,
      'sess_new',
      new Date(Date.now() + 60_000),
    );

    expect(response.cookie).toHaveBeenCalledTimes(1);
    expect(response.cookie).toHaveBeenCalledWith(
      '__Host-twenty-session',
      'sess_new',
      expect.objectContaining({ httpOnly: true, secure: true }),
    );
  });
});
