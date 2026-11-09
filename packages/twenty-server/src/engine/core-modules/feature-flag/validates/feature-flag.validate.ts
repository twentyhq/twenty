import { FeatureFlagKey } from 'twenty-shared/types';

import { type CustomException } from 'src/utils/custom-exception';

const assertIsFeatureFlagKey = (
  featureFlagKey: string,
  exceptionToThrow: CustomException,
): asserts featureFlagKey is FeatureFlagKey => {
  if (featureFlagKey in FeatureFlagKey) {
    return;
  }
  throw exceptionToThrow;
};

export const featureFlagValidator: {
  assertIsFeatureFlagKey: typeof assertIsFeatureFlagKey;
} = {
  assertIsFeatureFlagKey: assertIsFeatureFlagKey,
};
