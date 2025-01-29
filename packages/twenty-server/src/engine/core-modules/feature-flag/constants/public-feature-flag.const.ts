import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

type FeatureFlagMetadata = {
  label: string;
  description: string;
  imagePath: string | null;
};

export type PublicFeatureFlag = {
  key: Extract<FeatureFlagKey, FeatureFlagKey.IsLocalizationEnabled>;
  metadata: FeatureFlagMetadata;
};

export const PUBLIC_FEATURE_FLAGS: PublicFeatureFlag[] = [
  {
    key: FeatureFlagKey.IsLocalizationEnabled,
    metadata: {
      label: 'Localization',
      description:
        "Our community is working on translating the app. Enable this flag and go to Settings > Experience to change your account's language.",
      imagePath: null,
    },
  },
];
