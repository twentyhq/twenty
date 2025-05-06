import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

type FeatureFlagMetadata = {
  label: string;
  description: string;
  imagePath: string;
};

export type PublicFeatureFlag = {
  key: Extract<
    FeatureFlagKey,
    FeatureFlagKey.IsWorkflowEnabled | FeatureFlagKey.IsCustomDomainEnabled
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
  /* Uncomment when ready to make the feature public
  {
    key: FeatureFlagKey.IsExternalEventEnabled,
    metadata: {
      label: 'External Events',
      description: 'Receive and validate events from external systems.',
      imagePath: 'https://twenty.com/images/lab/is-external-event-enabled.png',
    },
  },
  */
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
