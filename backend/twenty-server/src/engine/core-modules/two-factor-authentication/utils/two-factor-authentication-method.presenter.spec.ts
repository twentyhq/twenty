import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';

import { type TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { OTPStatus } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/otp.constants';

import { buildTwoFactorAuthenticationMethodSummary } from './two-factor-authentication-method.presenter';

describe('buildTwoFactorAuthenticationMethodSummary', () => {
  const createMockMethod = (
    id: string,
    status: OTPStatus,
    strategy: TwoFactorAuthenticationStrategy,
  ): TwoFactorAuthenticationMethodEntity =>
    ({
      id,
      status,
      strategy,
      userWorkspaceId: 'uw-123',
      userWorkspace: {} as any,
      secret: 'secret',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
    }) as unknown as TwoFactorAuthenticationMethodEntity;

  it('should return undefined when methods is undefined', () => {
    const result = buildTwoFactorAuthenticationMethodSummary(undefined);

    expect(result).toBeUndefined();
  });

  it('should return undefined when methods is null', () => {
    const result = buildTwoFactorAuthenticationMethodSummary(null as any);

    expect(result).toBeUndefined();
  });

  it('should return empty array when methods is empty array', () => {
    const result = buildTwoFactorAuthenticationMethodSummary([]);

    expect(result).toEqual([]);
  });

  it('should transform single method correctly', () => {
    const methods = [
      createMockMethod(
        'method-1',
        OTPStatus.VERIFIED,
        TwoFactorAuthenticationStrategy.TOTP,
      ),
    ];

    const result = buildTwoFactorAuthenticationMethodSummary(methods);

    expect(result).toEqual([
      {
        twoFactorAuthenticationMethodId: 'method-1',
        status: OTPStatus.VERIFIED,
        strategy: TwoFactorAuthenticationStrategy.TOTP,
      },
    ]);
  });

  it('should transform multiple methods correctly', () => {
    const methods = [
      createMockMethod(
        'method-1',
        OTPStatus.VERIFIED,
        TwoFactorAuthenticationStrategy.TOTP,
      ),
      createMockMethod(
        'method-2',
        OTPStatus.PENDING,
        TwoFactorAuthenticationStrategy.TOTP,
      ),
    ];

    const result = buildTwoFactorAuthenticationMethodSummary(methods);

    expect(result).toEqual([
      {
        twoFactorAuthenticationMethodId: 'method-1',
        status: OTPStatus.VERIFIED,
        strategy: TwoFactorAuthenticationStrategy.TOTP,
      },
      {
        twoFactorAuthenticationMethodId: 'method-2',
        status: OTPStatus.PENDING,
        strategy: TwoFactorAuthenticationStrategy.TOTP,
      },
    ]);
  });

  it('should only include relevant fields in summary', () => {
    const methods = [
      createMockMethod(
        'method-1',
        OTPStatus.VERIFIED,
        TwoFactorAuthenticationStrategy.TOTP,
      ),
    ];

    const result = buildTwoFactorAuthenticationMethodSummary(methods);

    expect(result![0]).toEqual({
      twoFactorAuthenticationMethodId: 'method-1',
      status: OTPStatus.VERIFIED,
      strategy: TwoFactorAuthenticationStrategy.TOTP,
    });

    // Ensure other fields are not included
    expect(result![0]).not.toHaveProperty('secret');
    expect(result![0]).not.toHaveProperty('userWorkspaceId');
    expect(result![0]).not.toHaveProperty('userWorkspace');
    expect(result![0]).not.toHaveProperty('createdAt');
    expect(result![0]).not.toHaveProperty('updatedAt');
    expect(result![0]).not.toHaveProperty('deletedAt');
  });

  it('should handle methods with different statuses', () => {
    const methods = [
      createMockMethod(
        'method-pending',
        OTPStatus.PENDING,
        TwoFactorAuthenticationStrategy.TOTP,
      ),
      createMockMethod(
        'method-verified',
        OTPStatus.VERIFIED,
        TwoFactorAuthenticationStrategy.TOTP,
      ),
    ];

    const result = buildTwoFactorAuthenticationMethodSummary(methods);

    expect(result).toHaveLength(2);
    expect(result![0]).toEqual({
      twoFactorAuthenticationMethodId: 'method-pending',
      status: OTPStatus.PENDING,
      strategy: TwoFactorAuthenticationStrategy.TOTP,
    });
    expect(result![1]).toEqual({
      twoFactorAuthenticationMethodId: 'method-verified',
      status: OTPStatus.VERIFIED,
      strategy: TwoFactorAuthenticationStrategy.TOTP,
    });
  });
});
