import { ExecutionContext } from '@nestjs/common';

import * as crypto from 'crypto';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

import { CloudflareSecretMatchGuard } from './cloudflare-secret.guard';

describe('CloudflareSecretMatchGuard.canActivate', () => {
  let guard: CloudflareSecretMatchGuard;
  let environmentService: EnvironmentService;

  beforeEach(() => {
    environmentService = {
      get: jest.fn(),
    } as unknown as EnvironmentService;
    guard = new CloudflareSecretMatchGuard(environmentService);
  });

  it('should return true when the webhook secret matches', () => {
    const mockRequest = { headers: { 'cf-webhook-auth': 'valid-secret' } };

    jest.spyOn(environmentService, 'get').mockReturnValue('valid-secret');

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(crypto, 'timingSafeEqual').mockReturnValue(true);

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should return true when env is not set', () => {
    const mockRequest = { headers: { 'cf-webhook-auth': 'valid-secret' } };

    jest.spyOn(environmentService, 'get').mockReturnValue(undefined);

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(crypto, 'timingSafeEqual').mockReturnValue(true);

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should return false if an error occurs', () => {
    const mockRequest = { headers: {} };

    jest.spyOn(environmentService, 'get').mockReturnValue('valid-secret');

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(false);
  });
});
