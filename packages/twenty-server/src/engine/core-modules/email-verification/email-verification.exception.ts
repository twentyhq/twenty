import { CustomException } from 'src/utils/custom-exception';

export class EmailVerificationException extends CustomException {
  constructor(message: string, code: EmailVerificationExceptionCode) {
    super(message, code);
  }
}

export enum EmailVerificationExceptionCode {
  EMAIL_VERIFICATION_NOT_REQUIRED = 'EMAIL_VERIFICATION_NOT_REQUIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  INVALID_APP_TOKEN_TYPE = 'INVALID_APP_TOKEN_TYPE',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  EMAIL_MISSING = 'EMAIL_MISSING',
  EMAIL_ALREADY_VERIFIED = 'EMAIL_ALREADY_VERIFIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}
