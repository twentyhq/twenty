import { CustomException } from 'src/utils/custom-exception';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { isDefined } from 'src/utils/is-defined';

const assertIsFeatureFlagKey = (
  featureFlagKey: string,
  exceptionToThrow: CustomException,
): asserts featureFlagKey is FeatureFlagKey => {
  if (isDefined(FeatureFlagKey[featureFlagKey])) return;
  throw exceptionToThrow;
};

export const featureFlagValidator: {
  assertIsFeatureFlagKey: typeof assertIsFeatureFlagKey;
} = {
  assertIsFeatureFlagKey: assertIsFeatureFlagKey,
};
