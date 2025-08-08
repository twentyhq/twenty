import {
  PUBLIC_FEATURE_FLAGS,
  type PublicFeatureFlag,
} from 'src/engine/core-modules/feature-flag/constants/public-feature-flag.const';
import { type FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

export const isPublicFeatureFlag = (
  key: FeatureFlagKey,
): key is PublicFeatureFlag['key'] => {
  if (!key) {
    return false;
  }

  return PUBLIC_FEATURE_FLAGS.some((flag) => flag.key === key);
};
