import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

type FeatureFlagMetadata = {
  label: string;
  description: string;
  imagePath: string;
};

export type PublicFeatureFlag = {
  key: FeatureFlagKey;
  metadata: FeatureFlagMetadata;
};

export const PUBLIC_FEATURE_FLAGS: PublicFeatureFlag[] = [
  {
    key: FeatureFlagKey.IS_PAGE_LAYOUT_ENABLED,
    metadata: {
      label: 'Dashboards',
      description: 'Enable dashboards',
      imagePath: 'https://twenty.com/images/lab/is-dashboards-enabled.png',
    },
  },
  {
    key: FeatureFlagKey.IS_IF_ELSE_ENABLED,
    metadata: {
      label: 'If/Else Workflow Node',
      description: 'Enable if/else conditional branching in workflows',
      imagePath: 'https://twenty.com/images/lab/is-if-else-enabled.png',
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
