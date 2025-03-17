import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

type FeatureFlagMetadata = {
  label: string;
  description: string;
  imagePath: string;
};

export type PublicFeatureFlag = {
  key: Extract<
    FeatureFlagKey,
    | FeatureFlagKey.IsWorkflowEnabled
    | FeatureFlagKey.IsPermissionsEnabled
    | FeatureFlagKey.IsCustomDomainEnabled
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
    key: FeatureFlagKey.IsPermissionsEnabled,
    metadata: {
      label: 'Permissions V1',
      description:
        'Role-based access control system for workspace security management (Admin/Member)',
      imagePath: 'https://twenty.com/images/lab/is-permissions-enabled.png',
    },
  },
  ...(process.env.CLOUDFLARE_API_KEY
    ? [
        {
          key: FeatureFlagKey.IsCustomDomainEnabled as PublicFeatureFlag['key'],
          metadata: {
            label: 'Custom Domain',
            description: 'Customize your workspace URL with your own domain.',
            imagePath:
              'https://twenty.com/images/lab/is-custom-domain-enabled.png',
          },
        },
      ]
    : []),
];
