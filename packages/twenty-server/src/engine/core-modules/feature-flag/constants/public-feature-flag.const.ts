import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

type FeatureFlagMetadata = {
  label: string;
  description: string;
  imagePath: string;
};

export type PublicFeatureFlag = {
  key: Extract<FeatureFlagKey, FeatureFlagKey.IS_WORKFLOW_ENABLED>;
  metadata: FeatureFlagMetadata;
};

export const PUBLIC_FEATURE_FLAGS: PublicFeatureFlag[] = [
  {
    key: FeatureFlagKey.IS_WORKFLOW_ENABLED,
    metadata: {
      label: 'Workflows',
      description: 'Create custom workflows to automate your work.',
      imagePath: 'https://twenty.com/images/lab/is-workflow-enabled.png',
    },
  },
  ...(process.env.CLOUDFLARE_API_KEY
    ? [
        // {
        // Here you can add cloud only feature flags
        // },
      ]
    : []),
];
