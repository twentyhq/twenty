import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

type FeatureFlagMetadata = {
  label: string;
  description: string;
  imagePath: string;
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
        "Enable this and go to Settings > Experience to change your account's language. You can also help us improve the translations on Github.",
      imagePath: 'https://twenty.com/images/releases/labs/translation.png',
    },
  },
];
