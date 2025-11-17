import { CustomException } from 'src/utils/custom-exception';

export class FeatureFlagException extends CustomException {
  constructor(message: string, code: FeatureFlagExceptionCode) {
    super(message, code);
  }
}

export enum FeatureFlagExceptionCode {
  FEATURE_FLAG_NOT_FOUND = 'FEATURE_FLAG_NOT_FOUND',
  FEATURE_FLAG_ALREADY_EXISTS = 'FEATURE_FLAG_ALREADY_EXISTS',
  FEATURE_FLAG_INVALID_KEY = 'FEATURE_FLAG_INVALID_KEY',
}
