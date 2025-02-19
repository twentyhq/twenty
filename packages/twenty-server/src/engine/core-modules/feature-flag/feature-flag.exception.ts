import { CustomException } from 'src/utils/custom-exception';

export class FeatureFlagException extends CustomException {
  constructor(message: string, code: FeatureFlagExceptionCode) {
    super(message, code);
  }
}

export enum FeatureFlagExceptionCode {
  INVALID_FEATURE_FLAG_KEY = 'INVALID_FEATURE_FLAG_KEY',
  FEATURE_FLAG_IS_NOT_PUBLIC = 'FEATURE_FLAG_IS_NOT_PUBLIC',
  FEATURE_FLAG_NOT_FOUND = 'FEATURE_FLAG_NOT_FOUND',
}
