import { Catch, ExceptionFilter } from '@nestjs/common';

import { t } from '@lingui/core/macro';

import {
  ForbiddenError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  TwoFactorAuthenticationException,
  TwoFactorAuthenticationExceptionCode,
} from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.exception';

@Catch(TwoFactorAuthenticationException)
export class TwoFactorAuthenticationExceptionFilter implements ExceptionFilter {
  catch(exception: TwoFactorAuthenticationException) {
    switch (exception.code) {
      case TwoFactorAuthenticationExceptionCode.INVALID_OTP:
        throw new UserInputError(exception.message, {
          subCode: exception.code,
          userFriendlyMessage: t`Invalid verification code. Please try again.`,
        });
      case TwoFactorAuthenticationExceptionCode.INVALID_CONFIGURATION:
      case TwoFactorAuthenticationExceptionCode.TWO_FACTOR_AUTHENTICATION_METHOD_NOT_FOUND:
      case TwoFactorAuthenticationExceptionCode.MALFORMED_DATABASE_OBJECT:
      case TwoFactorAuthenticationExceptionCode.TWO_FACTOR_AUTHENTICATION_METHOD_ALREADY_PROVISIONED:
        throw new ForbiddenError(exception);
      default: {
        const _exhaustiveCheck: never = exception.code;

        throw exception;
      }
    }
  }
}
