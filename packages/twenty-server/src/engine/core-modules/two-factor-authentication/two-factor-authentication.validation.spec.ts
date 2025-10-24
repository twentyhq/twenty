import {
  TwoFactorAuthenticationException,
  TwoFactorAuthenticationExceptionCode,
} from './two-factor-authentication.exception';
import { twoFactorAuthenticationMethodsValidator } from './two-factor-authentication.validation';

import { type TwoFactorAuthenticationMethodEntity } from './entities/two-factor-authentication-method.entity';
import { OTPStatus } from './strategies/otp/otp.constants';

describe('twoFactorAuthenticationMethodsValidator', () => {
  const createMockMethod = (
    status: OTPStatus = OTPStatus.VERIFIED,
  ): TwoFactorAuthenticationMethodEntity =>
    ({
      id: 'method-123',
      status,
      strategy: 'TOTP',
      userWorkspaceId: 'uw-123',
      userWorkspace: {} as any,
      secret: 'secret',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
    }) as unknown as TwoFactorAuthenticationMethodEntity;

  describe('assertIsDefinedOrThrow', () => {
    it('should not throw when method is defined', () => {
      const method = createMockMethod();

      expect(() =>
        twoFactorAuthenticationMethodsValidator.assertIsDefinedOrThrow(method),
      ).not.toThrow();
    });

    it('should throw default exception when method is null', () => {
      expect(() =>
        twoFactorAuthenticationMethodsValidator.assertIsDefinedOrThrow(null),
      ).toThrow(
        new TwoFactorAuthenticationException(
          '2FA method not found',
          TwoFactorAuthenticationExceptionCode.TWO_FACTOR_AUTHENTICATION_METHOD_NOT_FOUND,
        ),
      );
    });

    it('should throw default exception when method is undefined', () => {
      expect(() =>
        twoFactorAuthenticationMethodsValidator.assertIsDefinedOrThrow(
          undefined,
        ),
      ).toThrow(
        new TwoFactorAuthenticationException(
          '2FA method not found',
          TwoFactorAuthenticationExceptionCode.TWO_FACTOR_AUTHENTICATION_METHOD_NOT_FOUND,
        ),
      );
    });

    it('should throw custom exception when provided', () => {
      const customException = new TwoFactorAuthenticationException(
        'Custom error message',
        TwoFactorAuthenticationExceptionCode.INVALID_CONFIGURATION,
      );

      expect(() =>
        twoFactorAuthenticationMethodsValidator.assertIsDefinedOrThrow(
          null,
          customException,
        ),
      ).toThrow(customException);
    });
  });

  describe('areDefined', () => {
    it('should return true when methods array has items', () => {
      const methods = [createMockMethod()];

      const result =
        twoFactorAuthenticationMethodsValidator.areDefined(methods);

      expect(result).toBe(true);
    });

    it('should return true when methods array has multiple items', () => {
      const methods = [createMockMethod(), createMockMethod()];

      const result =
        twoFactorAuthenticationMethodsValidator.areDefined(methods);

      expect(result).toBe(true);
    });

    it('should return false when methods array is empty', () => {
      const methods: TwoFactorAuthenticationMethodEntity[] = [];

      const result =
        twoFactorAuthenticationMethodsValidator.areDefined(methods);

      expect(result).toBe(false);
    });

    it('should return false when methods is null', () => {
      const result = twoFactorAuthenticationMethodsValidator.areDefined(null);

      expect(result).toBe(false);
    });

    it('should return false when methods is undefined', () => {
      const result =
        twoFactorAuthenticationMethodsValidator.areDefined(undefined);

      expect(result).toBe(false);
    });
  });

  describe('areVerified', () => {
    it('should return true when at least one method is verified', () => {
      const methods = [
        createMockMethod(OTPStatus.VERIFIED),
        createMockMethod(OTPStatus.PENDING),
      ];

      const result =
        twoFactorAuthenticationMethodsValidator.areVerified(methods);

      expect(result).toBe(true);
    });

    it('should return true when all methods are verified', () => {
      const methods = [
        createMockMethod(OTPStatus.VERIFIED),
        createMockMethod(OTPStatus.VERIFIED),
      ];

      const result =
        twoFactorAuthenticationMethodsValidator.areVerified(methods);

      expect(result).toBe(true);
    });

    it('should return false when no methods are verified', () => {
      const methods = [
        createMockMethod(OTPStatus.PENDING),
        createMockMethod(OTPStatus.PENDING),
      ];

      const result =
        twoFactorAuthenticationMethodsValidator.areVerified(methods);

      expect(result).toBe(false);
    });

    it('should return false when methods array is empty', () => {
      const methods: TwoFactorAuthenticationMethodEntity[] = [];

      const result =
        twoFactorAuthenticationMethodsValidator.areVerified(methods);

      expect(result).toBe(false);
    });

    it('should return true when single method is verified', () => {
      const methods = [createMockMethod(OTPStatus.VERIFIED)];

      const result =
        twoFactorAuthenticationMethodsValidator.areVerified(methods);

      expect(result).toBe(true);
    });

    it('should return false when single method is pending', () => {
      const methods = [createMockMethod(OTPStatus.PENDING)];

      const result =
        twoFactorAuthenticationMethodsValidator.areVerified(methods);

      expect(result).toBe(false);
    });
  });
});
