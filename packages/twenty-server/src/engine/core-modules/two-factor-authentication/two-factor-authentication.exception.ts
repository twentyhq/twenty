import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum TwoFactorAuthenticationExceptionCode {
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  TWO_FACTOR_AUTHENTICATION_METHOD_NOT_FOUND = 'TWO_FACTOR_AUTHENTICATION_METHOD_NOT_FOUND',
  INVALID_OTP = 'INVALID_OTP',
  TWO_FACTOR_AUTHENTICATION_METHOD_ALREADY_PROVISIONED = 'TWO_FACTOR_AUTHENTICATION_METHOD_ALREADY_PROVISIONED',
  MALFORMED_DATABASE_OBJECT = 'MALFORMED_DATABASE_OBJECT',
}

const twoFactorAuthenticationExceptionUserFriendlyMessages: Record<
  TwoFactorAuthenticationExceptionCode,
  MessageDescriptor
> = {
  [TwoFactorAuthenticationExceptionCode.INVALID_CONFIGURATION]: msg`Invalid two-factor authentication configuration.`,
  [TwoFactorAuthenticationExceptionCode.TWO_FACTOR_AUTHENTICATION_METHOD_NOT_FOUND]: msg`Two-factor authentication method not found.`,
  [TwoFactorAuthenticationExceptionCode.INVALID_OTP]: msg`Invalid verification code.`,
  [TwoFactorAuthenticationExceptionCode.TWO_FACTOR_AUTHENTICATION_METHOD_ALREADY_PROVISIONED]: msg`Two-factor authentication is already set up.`,
  [TwoFactorAuthenticationExceptionCode.MALFORMED_DATABASE_OBJECT]: msg`An error occurred with two-factor authentication data.`,
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
        twoFactorAuthenticationExceptionUserFriendlyMessages[code],
    });
  }
}
