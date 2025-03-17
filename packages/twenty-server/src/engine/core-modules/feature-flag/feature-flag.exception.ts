import { FeatureFlagExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class FeatureFlagException extends CustomException {
  constructor(message: string, code: FeatureFlagExceptionCode) {
    super(message, code);
  }
}
