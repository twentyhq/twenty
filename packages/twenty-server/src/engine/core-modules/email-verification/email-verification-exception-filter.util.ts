import { Catch, ExceptionFilter } from '@nestjs/common';

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
      case EmailVerificationExceptionCode.INVALID_TOKEN:
      case EmailVerificationExceptionCode.INVALID_APP_TOKEN_TYPE:
      case EmailVerificationExceptionCode.TOKEN_EXPIRED:
      case EmailVerificationExceptionCode.RATE_LIMIT_EXCEEDED:
        throw new ForbiddenError(exception.message);
      case EmailVerificationExceptionCode.EMAIL_MISSING:
      case EmailVerificationExceptionCode.EMAIL_ALREADY_VERIFIED:
      case EmailVerificationExceptionCode.EMAIL_VERIFICATION_NOT_REQUIRED:
        throw new UserInputError(exception.message);
      default: {
        const _exhaustiveCheck: never = exception.code;

        throw exception;
      }
    }
  }
}
