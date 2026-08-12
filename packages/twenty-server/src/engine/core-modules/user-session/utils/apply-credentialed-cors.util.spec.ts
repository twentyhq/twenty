import { type INestApplication, Logger } from '@nestjs/common';

import { type NextFunction, type Request, type Response } from 'express';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { applyCredentialedCors } from 'src/engine/core-modules/user-session/utils/apply-credentialed-cors.util';

describe('applyCredentialedCors', () => {
  const defaultConfig: Record<string, unknown> = {
    NODE_ENV: 'production',
    SERVER_URL: 'https://crm.example.com',
    FRONTEND_URL: undefined,
    AUTH_COOKIE_ALLOWED_ORIGINS: '',
  };

  let mockConfig: Record<string, unknown> = { ...defaultConfig };

  const buildMiddleware = () => {
    const app = {
      use: jest.fn(),
      enableCors: jest.fn(),
    } as unknown as INestApplication;

    applyCredentialedCors(app, {
      get: jest.fn((key: string) => mockConfig[key]),
    } as unknown as TwentyConfigService);

    return (app.use as jest.Mock).mock.calls[0][0] as (
      request: Request,
      response: Response,
      next: NextFunction,
    ) => void;
  };

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

  const buildResponse = (): Response =>
    ({ vary: jest.fn() }) as unknown as Response;

  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfig = { ...defaultConfig };
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  it('should warn once per disallowed cross-origin preflight and always call next', () => {
    const middleware = buildMiddleware();
    const next = jest.fn();
    const response = buildResponse();

    middleware(
      buildPreflightRequest({ origin: 'https://tenant.example.net' }),
      response,
      next,
    );
    middleware(
      buildPreflightRequest({ origin: 'https://tenant.example.net' }),
      response,
      next,
    );

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://tenant.example.net'),
    );
    expect(response.vary).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('should not warn for an allowlisted origin', () => {
    mockConfig.AUTH_COOKIE_ALLOWED_ORIGINS = 'https://front.example.net';
    const middleware = buildMiddleware();

    middleware(
      buildPreflightRequest({ origin: 'https://front.example.net' }),
      buildResponse(),
      jest.fn(),
    );

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should not warn for a same-origin preflight since browsers do not enforce CORS on it', () => {
    const middleware = buildMiddleware();

    middleware(
      buildPreflightRequest({
        origin: 'https://lan.example.internal',
        host: 'lan.example.internal',
      }),
      buildResponse(),
      jest.fn(),
    );

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should not warn for requests that are not browser preflights', () => {
    const middleware = buildMiddleware();

    middleware(
      buildPreflightRequest({
        origin: 'https://tenant.example.net',
        method: 'POST',
      }),
      buildResponse(),
      jest.fn(),
    );
    middleware(
      buildPreflightRequest({
        origin: 'https://tenant.example.net',
        requestedMethod: '',
      }),
      buildResponse(),
      jest.fn(),
    );

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
