import { FeatureFlagKey } from 'twenty-shared/types';

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
    key: FeatureFlagKey.IS_SETTINGS_DISCOVERY_HERO_ENABLED,
    metadata: {
      label: 'Settings Discovery Hero',
      description:
        'Show the per-page hero illustration + video walkthrough modal on settings pages',
    },
  },
  {
    key: FeatureFlagKey.IS_MESSAGING_CALENDAR_WEBHOOK_ENABLED,
    metadata: {
      label: 'Messaging & Calendar Webhooks',
      description:
        'Sync Gmail, Google Calendar, and Microsoft 365 mail/calendar via provider push notifications instead of cron polling',
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
