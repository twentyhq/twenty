import { Test, type TestingModule } from '@nestjs/testing';

import { type Request, type Response } from 'express';
import {
  FRONT_COMPONENT_HOST_FETCH_HEADER_NAME,
  SESSION_COOKIE_OPT_IN_HEADER_NAME,
} from 'twenty-shared/constants';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
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
  let incrementCounterBy: jest.Mock;

  beforeEach(async () => {
    incrementCounterBy = jest.fn();

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
        { provide: MetricsService, useValue: { incrementCounterBy } },
      ],
    }).compile();

    service = module.get(UserSessionCookieService);
  });

  it('should read the session cookie on opted-in requests', () => {
    const request = buildRequest({ [SESSION_COOKIE_OPT_IN_HEADER_NAME]: '1' });

    expect(service.extractSessionTokenFromRequest(request)).toBe('sess_abc');
    expect(service.hasSessionCookie(request)).toBe(true);
    expect(incrementCounterBy).not.toHaveBeenCalled();
  });

  it('should read the session cookie on top-level navigations', () => {
    const request = buildRequest({ 'sec-fetch-mode': 'navigate' });

    expect(service.extractSessionTokenFromRequest(request)).toBe('sess_abc');
  });

  it('should still read the session cookie on legacy requests and count them by API path', () => {
    const request = {
      ...buildRequest({ 'sec-fetch-mode': 'cors' }),
      path: '/file-upload/upload-id',
    } as Request;

    expect(service.extractSessionTokenFromRequest(request)).toBe('sess_abc');
    expect(incrementCounterBy).toHaveBeenCalledWith({
      key: MetricsKeys.UserSessionCookieLegacyAccess,
      amount: 1,
      attributes: { apiPath: 'file-upload' },
    });
  });

  it('should ignore the session cookie on front component host fetches', () => {
    const request = buildRequest({
      'sec-fetch-mode': 'cors',
      [FRONT_COMPONENT_HOST_FETCH_HEADER_NAME]: '1',
    });

    expect(service.extractSessionTokenFromRequest(request)).toBeUndefined();
    expect(
      service.extractImpersonatorSessionTokenFromRequest(request),
    ).toBeUndefined();
    expect(service.hasSessionCookie(request)).toBe(false);
  });

  it('should not set or clear session cookies in response to front component host fetches', () => {
    const response = buildResponse(
      buildRequest({ [FRONT_COMPONENT_HOST_FETCH_HEADER_NAME]: '1' }),
    );

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

    expect(response.cookie).toHaveBeenCalledWith(
      '__Host-twenty-session',
      'sess_new',
      expect.objectContaining({ httpOnly: true, secure: true }),
    );
  });
});
