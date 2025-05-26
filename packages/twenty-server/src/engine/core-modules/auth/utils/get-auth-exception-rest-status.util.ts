import {
  AuthException,
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
      return 403;
    case AuthExceptionCode.INVALID_DATA:
    case AuthExceptionCode.UNAUTHENTICATED:
    case AuthExceptionCode.USER_NOT_FOUND:
    case AuthExceptionCode.WORKSPACE_NOT_FOUND:
      return 401;
    case AuthExceptionCode.INTERNAL_SERVER_ERROR:
    case AuthExceptionCode.USER_WORKSPACE_NOT_FOUND:
      return 500;
    default: {
      const _exhaustiveCheck: never = exception.code;

      return 500;
    }
  }
};
