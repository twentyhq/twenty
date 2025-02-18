import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

type FeatureFlagMetadata = {
  label: string;
  description: string;
  imagePath: string;
};

export type PublicFeatureFlag = {
  key: Extract<
    FeatureFlagKey,
    FeatureFlagKey.IsWorkflowEnabled | FeatureFlagKey.IsCommandMenuV2Enabled
  >;
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
  {
    key: FeatureFlagKey.IsCommandMenuV2Enabled,
    metadata: {
      label: 'Side Panel',
      description:
        'Click on the 3 dots menu at the top right or press command K to open your new side panel.',
      imagePath: 'https://twenty.com/images/lab/side-panel.png',
    },
  },
];
