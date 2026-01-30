import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const AuthExceptionCode = appendCommonExceptionCode({
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_WORKSPACE_NOT_FOUND: 'USER_WORKSPACE_NOT_FOUND',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  CLIENT_NOT_FOUND: 'CLIENT_NOT_FOUND',
  WORKSPACE_NOT_FOUND: 'WORKSPACE_NOT_FOUND',
  APPLICATION_NOT_FOUND: 'APPLICATION_NOT_FOUND',
  INVALID_INPUT: 'INVALID_INPUT',
  FORBIDDEN_EXCEPTION: 'FORBIDDEN_EXCEPTION',
  INSUFFICIENT_SCOPES: 'INSUFFICIENT_SCOPES',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  INVALID_DATA: 'INVALID_DATA',
  OAUTH_ACCESS_DENIED: 'OAUTH_ACCESS_DENIED',
  SSO_AUTH_FAILED: 'SSO_AUTH_FAILED',
  USE_SSO_AUTH: 'USE_SSO_AUTH',
  SIGNUP_DISABLED: 'SIGNUP_DISABLED',
  GOOGLE_API_AUTH_DISABLED: 'GOOGLE_API_AUTH_DISABLED',
  MICROSOFT_API_AUTH_DISABLED: 'MICROSOFT_API_AUTH_DISABLED',
  MISSING_ENVIRONMENT_VARIABLE: 'MISSING_ENVIRONMENT_VARIABLE',
  INVALID_JWT_TOKEN_TYPE: 'INVALID_JWT_TOKEN_TYPE',
  TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED:
    'TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED',
  TWO_FACTOR_AUTHENTICATION_VERIFICATION_REQUIRED:
    'TWO_FACTOR_AUTHENTICATION_VERIFICATION_REQUIRED',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
} as const);

const getAuthExceptionUserFriendlyMessage = (
  code: keyof typeof AuthExceptionCode,
) => {
  switch (code) {
    case AuthExceptionCode.USER_NOT_FOUND:
      return msg`User not found.`;
    case AuthExceptionCode.USER_WORKSPACE_NOT_FOUND:
      return msg`User workspace not found.`;
    case AuthExceptionCode.EMAIL_NOT_VERIFIED:
      return msg`Email is not verified.`;
    case AuthExceptionCode.WORKSPACE_NOT_FOUND:
      return msg`Workspace not found.`;
    case AuthExceptionCode.APPLICATION_NOT_FOUND:
      return msg`Application not found.`;
    case AuthExceptionCode.INVALID_INPUT:
      return msg`Invalid input provided.`;
    case AuthExceptionCode.FORBIDDEN_EXCEPTION:
      return msg`You do not have permission to perform this action.`;
    case AuthExceptionCode.INSUFFICIENT_SCOPES:
      return msg`Insufficient permissions.`;
    case AuthExceptionCode.UNAUTHENTICATED:
      return msg`You must be authenticated to perform this action.`;
    case AuthExceptionCode.OAUTH_ACCESS_DENIED:
      return msg`OAuth access was denied.`;
    case AuthExceptionCode.SSO_AUTH_FAILED:
      return msg`Single sign-on authentication failed.`;
    case AuthExceptionCode.USE_SSO_AUTH:
      return msg`Please use single sign-on to authenticate.`;
    case AuthExceptionCode.SIGNUP_DISABLED:
      return msg`Sign up is disabled.`;
    case AuthExceptionCode.GOOGLE_API_AUTH_DISABLED:
      return msg`Google API authentication is disabled.`;
    case AuthExceptionCode.MICROSOFT_API_AUTH_DISABLED:
      return msg`Microsoft API authentication is disabled.`;
    case AuthExceptionCode.MISSING_ENVIRONMENT_VARIABLE:
      return msg`A required configuration is missing.`;
    case AuthExceptionCode.TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED:
      return msg`Two-factor authentication setup is required.`;
    case AuthExceptionCode.TWO_FACTOR_AUTHENTICATION_VERIFICATION_REQUIRED:
      return msg`Two-factor authentication verification is required.`;
    case AuthExceptionCode.USER_ALREADY_EXISTS:
      return msg`A user with this email already exists.`;
    case AuthExceptionCode.INTERNAL_SERVER_ERROR:
    case AuthExceptionCode.INVALID_DATA:
    case AuthExceptionCode.CLIENT_NOT_FOUND:
    case AuthExceptionCode.INVALID_JWT_TOKEN_TYPE:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
};

export class AuthException extends CustomException<
  keyof typeof AuthExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof AuthExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getAuthExceptionUserFriendlyMessage(code),
    });
  }
}
