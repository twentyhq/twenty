import { CustomException } from 'src/utils/custom-exception';

export class EncryptionException extends CustomException {
  constructor(message: string, code: EncryptionExceptionCode) {
    super(message, code);
  }
}

export enum EncryptionExceptionCode {
  KEY_ENCRYPTION_KEY_LENGTH_INVALID = 'KEY_ENCRYPTION_KEY_LENGTH_INVALID',
  DATA_ENCRYPTION_KEY_LENGTH_INVALID = 'DATA_ENCRYPTION_KEY_LENGTH_INVALID',
  KEY_UNWRAPPING_FAILED = 'KEY_UNWRAPPING_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}
