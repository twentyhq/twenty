import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

type FeatureFlagMetadata = {
  label: string;
  description: string;
  imagePath?: string;
};

export type PublicFeatureFlag = {
  key: FeatureFlagKey;
  metadata: FeatureFlagMetadata;
};

export const PUBLIC_FEATURE_FLAGS: PublicFeatureFlag[] = [
  {
    key: FeatureFlagKey.IS_JUNCTION_RELATIONS_ENABLED,
    metadata: {
      label: 'Junction Relations',
      description:
        'Enable many-to-many relations through junction tables configuration',
    },
  },
  {
    key: FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_PREDICATES_ENABLED,
    metadata: {
      label: 'Row Level Permissions',
      description: 'Enable row level permission',
      imagePath:
        'https://twenty.com/images/lab/is-row-level-permission-predicates-enabled.png',
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
