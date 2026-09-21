import { Logger } from '@nestjs/common';

import { type Request } from 'express';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { warnOnceOnDisallowedBrowserPreflight } from 'src/engine/core-modules/user-session/utils/apply-credentialed-cors.util';

describe('warnOnceOnDisallowedBrowserPreflight', () => {
  const defaultConfig: Record<string, unknown> = {
    NODE_ENV: 'production',
    SERVER_URL: 'https://crm.example.com',
    FRONTEND_URL: undefined,
    AUTH_COOKIE_ALLOWED_ORIGINS: '',
  };

  let mockConfig: Record<string, unknown> = { ...defaultConfig };

  const twentyConfigService = {
    get: jest.fn((key: string) => mockConfig[key]),
  } as unknown as TwentyConfigService;

  const buildPreflightRequest = ({
    origin,
    host = 'crm.example.com',
    method = 'OPTIONS',
    requestedMethod = 'POST',
  }: {
    origin?: string;
    host?: string;
    method?: string;
    requestedMethod?: string;
  }): Request =>
    ({
      method,
      protocol: 'https',
      headers: {
        origin,
        'access-control-request-method': requestedMethod,
      },
      get: jest.fn().mockReturnValue(host),
    }) as unknown as Request;

  let warnSpy: jest.SpyInstance;
  let warnedOrigins: Set<string>;

  beforeEach(() => {
    mockConfig = { ...defaultConfig };
    warnedOrigins = new Set<string>();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should warn once per disallowed cross-origin preflight', () => {
    warnOnceOnDisallowedBrowserPreflight({
      request: buildPreflightRequest({ origin: 'https://tenant.example.net' }),
      twentyConfigService,
      warnedOrigins,
    });
    warnOnceOnDisallowedBrowserPreflight({
      request: buildPreflightRequest({ origin: 'https://tenant.example.net' }),
      twentyConfigService,
      warnedOrigins,
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://tenant.example.net'),
    );
  });

  it('should not warn for an allowlisted origin', () => {
    mockConfig.AUTH_COOKIE_ALLOWED_ORIGINS = 'https://front.example.net';

    warnOnceOnDisallowedBrowserPreflight({
      request: buildPreflightRequest({ origin: 'https://front.example.net' }),
      twentyConfigService,
      warnedOrigins,
    });

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should not warn for a same-origin preflight since browsers do not enforce CORS on it', () => {
    warnOnceOnDisallowedBrowserPreflight({
      request: buildPreflightRequest({
        origin: 'https://lan.example.internal',
        host: 'lan.example.internal',
      }),
      twentyConfigService,
      warnedOrigins,
    });

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should not warn for requests that are not browser preflights', () => {
    warnOnceOnDisallowedBrowserPreflight({
      request: buildPreflightRequest({
        origin: 'https://tenant.example.net',
        method: 'POST',
      }),
      twentyConfigService,
      warnedOrigins,
    });
    warnOnceOnDisallowedBrowserPreflight({
      request: buildPreflightRequest({
        origin: 'https://tenant.example.net',
        requestedMethod: '',
      }),
      twentyConfigService,
      warnedOrigins,
    });

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
