import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum EmailVerificationExceptionCode {
  EMAIL_VERIFICATION_NOT_REQUIRED = 'EMAIL_VERIFICATION_NOT_REQUIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  INVALID_APP_TOKEN_TYPE = 'INVALID_APP_TOKEN_TYPE',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  EMAIL_MISSING = 'EMAIL_MISSING',
  EMAIL_ALREADY_VERIFIED = 'EMAIL_ALREADY_VERIFIED',
  INVALID_EMAIL = 'INVALID_EMAIL',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

const emailVerificationExceptionUserFriendlyMessages: Record<
  EmailVerificationExceptionCode,
  MessageDescriptor
> = {
  [EmailVerificationExceptionCode.EMAIL_VERIFICATION_NOT_REQUIRED]: msg`Email verification is not required.`,
  [EmailVerificationExceptionCode.INVALID_TOKEN]: msg`Invalid verification token.`,
  [EmailVerificationExceptionCode.INVALID_APP_TOKEN_TYPE]: msg`Invalid token type.`,
  [EmailVerificationExceptionCode.TOKEN_EXPIRED]: msg`Verification token has expired.`,
  [EmailVerificationExceptionCode.EMAIL_MISSING]: msg`Email is required.`,
  [EmailVerificationExceptionCode.EMAIL_ALREADY_VERIFIED]: msg`Email is already verified.`,
  [EmailVerificationExceptionCode.INVALID_EMAIL]: msg`Invalid email address.`,
  [EmailVerificationExceptionCode.RATE_LIMIT_EXCEEDED]: msg`Too many requests. Please try again later.`,
};

export class EmailVerificationException extends CustomException<EmailVerificationExceptionCode> {
  constructor(
    message: string,
    code: EmailVerificationExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        emailVerificationExceptionUserFriendlyMessages[code],
    });
  }
}
