import {
  PUBLIC_FEATURE_FLAGS,
  PublicFeatureFlag,
} from 'src/engine/core-modules/feature-flag/constants/public-feature-flag.const';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

export const isPublicFeatureFlag = (
  key: FeatureFlagKey,
): key is PublicFeatureFlag['key'] => {
  if (!key) {
    return false;
  }

  // Convert camelCase to UPPER_CASE if needed
  const normalizedKey = key.includes('_')
    ? key
    : key.replace(/([A-Z])/g, '_$1').toUpperCase();

  return PUBLIC_FEATURE_FLAGS.some(
    (flag) =>
      flag.key === normalizedKey ||
      flag.key === key ||
      // Also check if the flag key matches after normalization
      (typeof flag.key === 'string' &&
        flag.key.replace(/([A-Z])/g, '_$1').toUpperCase() === normalizedKey),
  );
};
