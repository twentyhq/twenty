import { CustomException } from 'src/utils/custom-exception';

export class FeatureFlagException extends CustomException<FeatureFlagExceptionCode> {}

export enum FeatureFlagExceptionCode {
  INVALID_FEATURE_FLAG_KEY = 'INVALID_FEATURE_FLAG_KEY',
}
