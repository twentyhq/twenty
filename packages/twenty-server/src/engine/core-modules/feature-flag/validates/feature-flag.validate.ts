import { isDefined } from 'twenty-shared';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { CustomException } from 'src/utils/custom-exception';

const assertIsFeatureFlagKey = (
  featureFlagKey: string,
  exceptionToThrow: CustomException,
): asserts featureFlagKey is FeatureFlagKey => {
  // Convert camelCase to UPPER_CASE if needed
  const normalizedKey = featureFlagKey.includes('_')
    ? featureFlagKey
    : featureFlagKey.replace(/([A-Z])/g, '_$1').toUpperCase();

  if (
    isDefined(FeatureFlagKey[normalizedKey]) ||
    isDefined(FeatureFlagKey[featureFlagKey])
  )
    return;
  throw exceptionToThrow;
};

export const featureFlagValidator: {
  assertIsFeatureFlagKey: typeof assertIsFeatureFlagKey;
} = {
  assertIsFeatureFlagKey: assertIsFeatureFlagKey,
};
