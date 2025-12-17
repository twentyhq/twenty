import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

const authExceptionUserFriendlyMessages: Record<
  keyof typeof AuthExceptionCode,
  MessageDescriptor
> = {
  USER_NOT_FOUND: msg`User not found.`,
  USER_WORKSPACE_NOT_FOUND: msg`User workspace not found.`,
  EMAIL_NOT_VERIFIED: msg`Email is not verified.`,
  CLIENT_NOT_FOUND: msg`Client not found.`,
  WORKSPACE_NOT_FOUND: msg`Workspace not found.`,
  APPLICATION_NOT_FOUND: msg`Application not found.`,
  INVALID_INPUT: msg`Invalid input provided.`,
  FORBIDDEN_EXCEPTION: msg`You do not have permission to perform this action.`,
  INSUFFICIENT_SCOPES: msg`Insufficient permissions.`,
  UNAUTHENTICATED: msg`You must be authenticated to perform this action.`,
  INVALID_DATA: msg`Invalid data provided.`,
  OAUTH_ACCESS_DENIED: msg`OAuth access was denied.`,
  SSO_AUTH_FAILED: msg`Single sign-on authentication failed.`,
  USE_SSO_AUTH: msg`Please use single sign-on to authenticate.`,
  SIGNUP_DISABLED: msg`Sign up is disabled.`,
  GOOGLE_API_AUTH_DISABLED: msg`Google API authentication is disabled.`,
  MICROSOFT_API_AUTH_DISABLED: msg`Microsoft API authentication is disabled.`,
  MISSING_ENVIRONMENT_VARIABLE: msg`A required configuration is missing.`,
  INVALID_JWT_TOKEN_TYPE: msg`Invalid authentication token.`,
  TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED: msg`Two-factor authentication setup is required.`,
  TWO_FACTOR_AUTHENTICATION_VERIFICATION_REQUIRED: msg`Two-factor authentication verification is required.`,
  USER_ALREADY_EXISTS: msg`A user with this email already exists.`,
  INTERNAL_SERVER_ERROR: msg`An unexpected error occurred.`,
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
        userFriendlyMessage ?? authExceptionUserFriendlyMessages[code],
    });
  }
}

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
