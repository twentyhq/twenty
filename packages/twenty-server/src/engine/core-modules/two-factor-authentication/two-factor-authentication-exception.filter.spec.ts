import {
  ForbiddenError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

import { TwoFactorAuthenticationExceptionFilter } from './two-factor-authentication-exception.filter';
import {
  TwoFactorAuthenticationException,
  TwoFactorAuthenticationExceptionCode,
} from './two-factor-authentication.exception';

describe('TwoFactorAuthenticationExceptionFilter', () => {
  let filter: TwoFactorAuthenticationExceptionFilter;

  beforeEach(() => {
    filter = new TwoFactorAuthenticationExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should throw UserInputError for INVALID_OTP exception', () => {
      const exception = new TwoFactorAuthenticationException(
        'Invalid OTP code',
        TwoFactorAuthenticationExceptionCode.INVALID_OTP,
      );

      expect(() => filter.catch(exception)).toThrow(UserInputError);

      try {
        filter.catch(exception);
      } catch (error) {
        expect(error).toBeInstanceOf(UserInputError);
        expect(error.message).toBe('Invalid OTP code');
        expect(error.extensions.subCode).toBe(
          TwoFactorAuthenticationExceptionCode.INVALID_OTP,
        );
        expect(error.extensions.userFriendlyMessage).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            message: 'Invalid verification code. Please try again.',
          }),
        );
      }
    });

    it('should throw ForbiddenError for INVALID_CONFIGURATION exception', () => {
      const exception = new TwoFactorAuthenticationException(
        'Invalid configuration',
        TwoFactorAuthenticationExceptionCode.INVALID_CONFIGURATION,
      );

      expect(() => filter.catch(exception)).toThrow(ForbiddenError);

      try {
        filter.catch(exception);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenError);
      }
    });

    it('should throw ForbiddenError for TWO_FACTOR_AUTHENTICATION_METHOD_NOT_FOUND exception', () => {
      const exception = new TwoFactorAuthenticationException(
        'Method not found',
        TwoFactorAuthenticationExceptionCode.TWO_FACTOR_AUTHENTICATION_METHOD_NOT_FOUND,
      );

      expect(() => filter.catch(exception)).toThrow(ForbiddenError);

      try {
        filter.catch(exception);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenError);
      }
    });

    it('should throw ForbiddenError for MALFORMED_DATABASE_OBJECT exception', () => {
      const exception = new TwoFactorAuthenticationException(
        'Malformed object',
        TwoFactorAuthenticationExceptionCode.MALFORMED_DATABASE_OBJECT,
      );

      expect(() => filter.catch(exception)).toThrow(ForbiddenError);

      try {
        filter.catch(exception);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenError);
      }
    });

    it('should throw ForbiddenError for TWO_FACTOR_AUTHENTICATION_METHOD_ALREADY_PROVISIONED exception', () => {
      const exception = new TwoFactorAuthenticationException(
        'Already provisioned',
        TwoFactorAuthenticationExceptionCode.TWO_FACTOR_AUTHENTICATION_METHOD_ALREADY_PROVISIONED,
      );

      expect(() => filter.catch(exception)).toThrow(ForbiddenError);

      try {
        filter.catch(exception);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenError);
      }
    });
  });
});
