import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';
import { msg } from '@lingui/core/macro';

import {
  EmailVerificationException,
  EmailVerificationExceptionCode,
} from 'src/engine/core-modules/email-verification/email-verification.exception';
import {
  ForbiddenError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(EmailVerificationException)
export class EmailVerificationExceptionFilter implements ExceptionFilter {
  catch(exception: EmailVerificationException) {
    switch (exception.code) {
      case EmailVerificationExceptionCode.TOKEN_EXPIRED:
        throw new ForbiddenError(exception.message, {
          subCode: exception.code,
          userFriendlyMessage: msg`Request has expired, please try again.`,
        });
      case EmailVerificationExceptionCode.INVALID_TOKEN:
      case EmailVerificationExceptionCode.INVALID_APP_TOKEN_TYPE:
      case EmailVerificationExceptionCode.RATE_LIMIT_EXCEEDED:
        throw new ForbiddenError(exception);
      case EmailVerificationExceptionCode.EMAIL_MISSING:
        throw new UserInputError(exception);
      case EmailVerificationExceptionCode.EMAIL_ALREADY_VERIFIED:
        throw new UserInputError(exception.message, {
          subCode: exception.code,
          userFriendlyMessage: msg`Email already verified.`,
        });
      case EmailVerificationExceptionCode.EMAIL_VERIFICATION_NOT_REQUIRED:
        throw new UserInputError(exception.message, {
          subCode: exception.code,
          userFriendlyMessage: msg`Email verification not required.`,
        });
      case EmailVerificationExceptionCode.INVALID_EMAIL:
        throw new UserInputError(exception);
      default: {
        assertUnreachable(exception.code);
      }
    }
  }
}
