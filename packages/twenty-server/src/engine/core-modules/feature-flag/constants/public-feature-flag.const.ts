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
    key: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
    metadata: {
      label: 'Inbox',
      description:
        'Share AI chat threads with teammates and triage them from a shared inbox',
      icon: 'IconInbox',
    },
  },
  {
    key: FeatureFlagKey.IS_LOOKUP_COLUMNS_ENABLED,
    metadata: {
      label: 'Summary columns',
      description:
        'Add table columns that count, total or list related records, or show a field of a related record',
      icon: 'IconStack2',
    },
  },
  {
    key: FeatureFlagKey.IS_MCP_SERVERS_ENABLED,
    metadata: {
      label: 'MCP servers',
      description:
        'Connect remote MCP servers so AI chat, agents and workflows can use their tools',
      icon: 'IconSparkles',
    },
  },
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
