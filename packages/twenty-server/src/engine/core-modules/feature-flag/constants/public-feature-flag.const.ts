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
    key: FeatureFlagKey.IS_AI_CHAT_PAGE_ENABLED,
    metadata: {
      label: 'Full-Page AI Chat',
      description:
        'Open the AI chat as a full page, with the records it surfaces appearing in the side panel',
      icon: 'IconSparkles',
    },
  },
  {
    key: FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED,
    metadata: {
      label: 'Calendar Day and Week Views',
      description:
        'Display calendar records in daily or weekly layouts with optional end dates',
      icon: 'IconCalendarWeek',
    },
  },
  {
    key: FeatureFlagKey.IS_JUNCTION_RELATIONS_ENABLED,
    metadata: {
      label: 'Junction Relations',
      description:
        'Enable many-to-many relations through junction tables configuration',
      icon: 'IconRelationManyToMany',
    },
  },
  {
    key: FeatureFlagKey.IS_LIST_VIEW_ENABLED,
    metadata: {
      label: 'List View',
      description:
        'Display records in a list layout with collapsible groups and inline fields',
      icon: 'IconList',
    },
  },
  {
    key: FeatureFlagKey.IS_SETTINGS_DISCOVERY_HERO_ENABLED,
    metadata: {
      label: 'Settings Discovery Hero',
      description:
        'Show the per-page hero illustration + video walkthrough modal on settings pages',
      icon: 'IconSparkles',
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
