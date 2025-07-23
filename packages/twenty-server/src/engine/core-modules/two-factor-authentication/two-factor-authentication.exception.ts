import { CustomException } from 'src/utils/custom-exception';

export class TwoFactorAuthenticationException extends CustomException {
  declare code: TwoFactorAuthenticationExceptionCode;
  constructor(message: string, code: TwoFactorAuthenticationExceptionCode) {
    super(message, code);
  }
}

export enum TwoFactorAuthenticationExceptionCode {
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  TWO_FACTOR_AUTHENTICATION_METHOD_NOT_FOUND = 'TWO_FACTOR_AUTHENTICATION_METHOD_NOT_FOUND',
  INVALID_OTP = 'INVALID_OTP',
  TWO_FACTOR_AUTHENTICATION_METHOD_ALREADY_PROVISIONED = 'TWO_FACTOR_AUTHENTICATION_METHOD_ALREADY_PROVISIONED',
  MALFORMED_DATABASE_OBJECT = 'MALFORMED_DATABASE_OBJECT',
}
