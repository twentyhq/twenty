import { type ExecutionContext } from '@nestjs/common';

import * as crypto from 'crypto';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { CloudflareSecretMatchGuard } from 'src/engine/core-modules/cloudflare/guards/cloudflare-secret.guard';

describe('CloudflareSecretMatchGuard.canActivate', () => {
  let guard: CloudflareSecretMatchGuard;
  let twentyConfigService: TwentyConfigService;

  beforeEach(() => {
    twentyConfigService = {
      get: jest.fn(),
    } as unknown as TwentyConfigService;
    guard = new CloudflareSecretMatchGuard(twentyConfigService);
  });

  it('should return true when the webhook secret matches', () => {
    const mockRequest = { headers: { 'cf-webhook-auth': 'valid-secret' } };

    jest.spyOn(twentyConfigService, 'get').mockReturnValue('valid-secret');

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

    jest.spyOn(twentyConfigService, 'get').mockReturnValue(undefined);

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

    jest.spyOn(twentyConfigService, 'get').mockReturnValue('valid-secret');

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(false);
  });
});
