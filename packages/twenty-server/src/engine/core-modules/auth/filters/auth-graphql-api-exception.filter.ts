import { Catch, ExceptionFilter } from '@nestjs/common';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import {
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(AuthException)
export class AuthGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: AuthException) {
    switch (exception.code) {
      case AuthExceptionCode.CLIENT_NOT_FOUND:
        throw new NotFoundError(exception.message);
      case AuthExceptionCode.INVALID_INPUT:
        throw new UserInputError(exception.message);
      case AuthExceptionCode.FORBIDDEN_EXCEPTION:
      case AuthExceptionCode.INSUFFICIENT_SCOPES:
      case AuthExceptionCode.OAUTH_ACCESS_DENIED:
      case AuthExceptionCode.SSO_AUTH_FAILED:
      case AuthExceptionCode.USE_SSO_AUTH:
      case AuthExceptionCode.SIGNUP_DISABLED:
      case AuthExceptionCode.GOOGLE_API_AUTH_DISABLED:
      case AuthExceptionCode.MICROSOFT_API_AUTH_DISABLED:
      case AuthExceptionCode.MISSING_ENVIRONMENT_VARIABLE:
      case AuthExceptionCode.INVALID_JWT_TOKEN_TYPE:
        throw new ForbiddenError(exception.message);
      case AuthExceptionCode.EMAIL_NOT_VERIFIED:
      case AuthExceptionCode.INVALID_DATA:
        throw new ForbiddenError(exception.message, {
          subCode: AuthExceptionCode.EMAIL_NOT_VERIFIED,
        });
      case AuthExceptionCode.UNAUTHENTICATED:
      case AuthExceptionCode.USER_NOT_FOUND:
      case AuthExceptionCode.WORKSPACE_NOT_FOUND:
        throw new AuthenticationError(exception.message);
      case AuthExceptionCode.INTERNAL_SERVER_ERROR:
      case AuthExceptionCode.USER_WORKSPACE_NOT_FOUND:
        throw exception;
      default: {
        const _exhaustiveCheck: never = exception.code;

        throw exception;
      }
    }
  }
}
