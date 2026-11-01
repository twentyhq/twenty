import { FeatureFlagKey } from 'twenty-shared/types';

type FeatureFlagMetadata = {
  label: string;
  description: string;
  icon: string;
  imagePath?: string;
};

export type PublicFeatureFlag = {
  key: FeatureFlagKey;
  metadata: FeatureFlagMetadata;
};

export const PUBLIC_FEATURE_FLAGS: PublicFeatureFlag[] = [
  {
    key: FeatureFlagKey.IS_REST_METADATA_API_NEW_FORMAT_DIRECT,
    metadata: {
      label: 'New REST Metadata API Format',
      description:
        'Return objects and fields from /rest/metadata without the legacy data.objects / data.fields wrapper. The legacy format will be discontinued on November 15, 2026.',
      icon: 'IconApi',
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
