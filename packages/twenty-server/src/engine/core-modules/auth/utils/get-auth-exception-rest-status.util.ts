import { assertUnreachable } from 'twenty-shared/utils';

import {
  type AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';

export const getAuthExceptionRestStatus = (exception: AuthException) => {
  switch (exception.code) {
    case AuthExceptionCode.CLIENT_NOT_FOUND:
      return 404;
    case AuthExceptionCode.INVALID_INPUT:
      return 400;
    case AuthExceptionCode.FORBIDDEN_EXCEPTION:
    case AuthExceptionCode.INSUFFICIENT_SCOPES:
    case AuthExceptionCode.OAUTH_ACCESS_DENIED:
    case AuthExceptionCode.SSO_AUTH_FAILED:
    case AuthExceptionCode.USE_SSO_AUTH:
    case AuthExceptionCode.SIGNUP_DISABLED:
    case AuthExceptionCode.GOOGLE_API_AUTH_DISABLED:
    case AuthExceptionCode.MICROSOFT_API_AUTH_DISABLED:
    case AuthExceptionCode.MISSING_ENVIRONMENT_VARIABLE:
    case AuthExceptionCode.EMAIL_NOT_VERIFIED:
    case AuthExceptionCode.INVALID_JWT_TOKEN_TYPE:
    case AuthExceptionCode.USER_ALREADY_EXISTS:
      return 403;
    case AuthExceptionCode.TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED:
    case AuthExceptionCode.TWO_FACTOR_AUTHENTICATION_VERIFICATION_REQUIRED:
    case AuthExceptionCode.INVALID_DATA:
    case AuthExceptionCode.UNAUTHENTICATED:
    case AuthExceptionCode.USER_NOT_FOUND:
    case AuthExceptionCode.WORKSPACE_NOT_FOUND:
    case AuthExceptionCode.APPLICATION_NOT_FOUND:
      return 401;
    case AuthExceptionCode.INTERNAL_SERVER_ERROR:
    case AuthExceptionCode.USER_WORKSPACE_NOT_FOUND:
      return 500;
    default: {
      assertUnreachable(exception.code);
    }
  }
};
