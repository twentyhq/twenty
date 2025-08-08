import { type PublicFeatureFlag } from 'src/engine/core-modules/feature-flag/constants/public-feature-flag.const';
import { type FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { isPublicFeatureFlag } from 'src/engine/core-modules/lab/utils/is-public-feature-flag.util';
import { type CustomException } from 'src/utils/custom-exception';

const assertIsPublicFeatureFlag = (
  key: FeatureFlagKey,
  exceptionToThrow: CustomException,
): asserts key is PublicFeatureFlag['key'] => {
  if (!isPublicFeatureFlag(key)) {
    throw exceptionToThrow;
  }
};

export const publicFeatureFlagValidator: {
  assertIsPublicFeatureFlag: typeof assertIsPublicFeatureFlag;
} = {
  assertIsPublicFeatureFlag: assertIsPublicFeatureFlag,
};
