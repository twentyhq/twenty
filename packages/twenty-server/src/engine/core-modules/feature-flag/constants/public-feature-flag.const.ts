import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

type FeatureFlagMetadata = {
  label: string;
  description: string;
  imagePath: string;
};

export type PublicFeatureFlag = {
  key: Extract<FeatureFlagKey, FeatureFlagKey.IsWorkflowEnabled>;
  metadata: FeatureFlagMetadata;
};

export const PUBLIC_FEATURE_FLAGS: PublicFeatureFlag[] = [
  {
    key: FeatureFlagKey.IsWorkflowEnabled,
    metadata: {
      label: 'Workflows',
      description: 'Create custom workflows to automate your work.',
      imagePath: 'https://twenty.com/images/lab/is-workflow-enabled.png',
    },
  },
];
