import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum TwoFactorAuthenticationExceptionCode {
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  TWO_FACTOR_AUTHENTICATION_METHOD_NOT_FOUND = 'TWO_FACTOR_AUTHENTICATION_METHOD_NOT_FOUND',
  INVALID_OTP = 'INVALID_OTP',
  TWO_FACTOR_AUTHENTICATION_METHOD_ALREADY_PROVISIONED = 'TWO_FACTOR_AUTHENTICATION_METHOD_ALREADY_PROVISIONED',
  MALFORMED_DATABASE_OBJECT = 'MALFORMED_DATABASE_OBJECT',
}

const getTwoFactorAuthenticationExceptionUserFriendlyMessage = (
  code: TwoFactorAuthenticationExceptionCode,
) => {
  switch (code) {
    case TwoFactorAuthenticationExceptionCode.INVALID_CONFIGURATION:
      return msg`Invalid two-factor authentication configuration.`;
    case TwoFactorAuthenticationExceptionCode.TWO_FACTOR_AUTHENTICATION_METHOD_NOT_FOUND:
      return msg`Two-factor authentication method not found.`;
    case TwoFactorAuthenticationExceptionCode.INVALID_OTP:
      return msg`Invalid verification code.`;
    case TwoFactorAuthenticationExceptionCode.TWO_FACTOR_AUTHENTICATION_METHOD_ALREADY_PROVISIONED:
      return msg`Two-factor authentication is already set up.`;
    case TwoFactorAuthenticationExceptionCode.MALFORMED_DATABASE_OBJECT:
      return msg`An error occurred with two-factor authentication data.`;
    default:
      assertUnreachable(code);
  }
};

export class TwoFactorAuthenticationException extends CustomException<TwoFactorAuthenticationExceptionCode> {
  constructor(
    message: string,
    code: TwoFactorAuthenticationExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getTwoFactorAuthenticationExceptionUserFriendlyMessage(code),
    });
  }
}
