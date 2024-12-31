import { CustomException } from 'src/utils/custom-exception';

export class EmailVerificationException extends CustomException {
  constructor(message: string, code: EmailVerificationExceptionCode) {
    super(message, code);
  }
}

export enum EmailVerificationExceptionCode {
  INVALID_APP_TOKEN_TYPE = 'INVALID_APP_TOKEN_TYPE',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  EMAIL_ALREADY_VERIFIED = 'EMAIL_ALREADY_VERIFIED',
  EMAIL_MISSING = 'EMAIL_MISSING',
  EMAIL_VERIFICATION_CORRUPTED = 'EMAIL_VERIFICATION_CORRUPTED',
}
