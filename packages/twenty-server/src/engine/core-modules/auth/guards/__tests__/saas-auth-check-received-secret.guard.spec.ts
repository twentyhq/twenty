import {
  InternalServerErrorException,
  type ExecutionContext,
} from '@nestjs/common';

import { SaasAuthCheckReceivedSecretGuard } from 'src/engine/core-modules/auth/guards/saas-auth-check-received-secret.guard';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const createExecutionContext = (
  headers: Record<string, string | undefined>,
): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers,
      }),
    }),
  }) as unknown as ExecutionContext;

describe('SaasAuthCheckReceivedSecretGuard', () => {
  let guard: SaasAuthCheckReceivedSecretGuard;
  let twentyConfigService: jest.Mocked<TwentyConfigService>;

  beforeEach(() => {
    twentyConfigService = {
      get: jest.fn().mockReturnValue('shared-secret'),
    } as unknown as jest.Mocked<TwentyConfigService>;

    guard = new SaasAuthCheckReceivedSecretGuard(twentyConfigService);
  });

  it('should allow requests with the configured shared secret', () => {
    const context = createExecutionContext({
      'x-saas-auth-secret': 'shared-secret',
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should reject requests with a missing shared secret header', () => {
    const context = createExecutionContext({});

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should reject requests with an invalid shared secret', () => {
    const context = createExecutionContext({
      'x-saas-auth-secret': 'wrong-secret',
    });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should throw when the configured shared secret is missing', () => {
    twentyConfigService.get.mockReturnValue('');

    const context = createExecutionContext({
      'x-saas-auth-secret': 'shared-secret',
    });

    expect(() => guard.canActivate(context)).toThrow(
      InternalServerErrorException,
    );
  });
});
