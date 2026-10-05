import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

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

const getEmailVerificationExceptionUserFriendlyMessage = (
  code: EmailVerificationExceptionCode,
) => {
  switch (code) {
    case EmailVerificationExceptionCode.EMAIL_VERIFICATION_NOT_REQUIRED:
      return msg`Email verification is not required.`;
    case EmailVerificationExceptionCode.INVALID_TOKEN:
    case EmailVerificationExceptionCode.INVALID_APP_TOKEN_TYPE:
    case EmailVerificationExceptionCode.TOKEN_EXPIRED:
      return msg`There is an issue with your token. Please try again.`;
    case EmailVerificationExceptionCode.EMAIL_MISSING:
      return msg`Email is required.`;
    case EmailVerificationExceptionCode.EMAIL_ALREADY_VERIFIED:
      return msg`Email is already verified.`;
    case EmailVerificationExceptionCode.INVALID_EMAIL:
      return msg`Invalid email address.`;
    case EmailVerificationExceptionCode.RATE_LIMIT_EXCEEDED:
      return msg`Too many requests. Please try again later.`;
    default:
      assertUnreachable(code);
  }
};
const EMAIL_VERIFICATION_EXCEPTION_CATEGORY_BY_CODE = {
  [EmailVerificationExceptionCode.EMAIL_VERIFICATION_NOT_REQUIRED]:
    'BAD_USER_INPUT',
  [EmailVerificationExceptionCode.INVALID_TOKEN]: 'FORBIDDEN',
  [EmailVerificationExceptionCode.INVALID_APP_TOKEN_TYPE]: 'FORBIDDEN',
  [EmailVerificationExceptionCode.TOKEN_EXPIRED]: 'FORBIDDEN',
  [EmailVerificationExceptionCode.EMAIL_MISSING]: 'BAD_USER_INPUT',
  [EmailVerificationExceptionCode.EMAIL_ALREADY_VERIFIED]: 'BAD_USER_INPUT',
  [EmailVerificationExceptionCode.INVALID_EMAIL]: 'BAD_USER_INPUT',
  [EmailVerificationExceptionCode.RATE_LIMIT_EXCEEDED]: 'FORBIDDEN',
} as const satisfies Record<EmailVerificationExceptionCode, ExceptionCategory>;

export class EmailVerificationException extends CustomException<EmailVerificationExceptionCode> {
  constructor(
    message: string,
    code: EmailVerificationExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getEmailVerificationExceptionUserFriendlyMessage(code),
      category: EMAIL_VERIFICATION_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
