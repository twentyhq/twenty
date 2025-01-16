import {
  PUBLIC_FEATURE_FLAGS,
  PublicFeatureFlag,
} from 'src/engine/core-modules/feature-flag/constants/public-feature-flag.const';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

export const isPublicFeatureFlag = (
  key: FeatureFlagKey,
): key is PublicFeatureFlag => {
  if (!key) {
    return false;
  }

  return PUBLIC_FEATURE_FLAGS.includes(key as PublicFeatureFlag);
};
