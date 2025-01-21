import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

type FeatureFlagMetadata = {
  label: string;
  description: string;
  imagePath: string;
};

export type PublicFeatureFlag = {
  key: Extract<FeatureFlagKey, never>;
  metadata: FeatureFlagMetadata;
};

export const PUBLIC_FEATURE_FLAGS: PublicFeatureFlag[] = [];
