import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

// Metadata type for public flags
type FeatureFlagMetadata = {
  label: string;
  description: string;
  imageKey?: string;
};

// This enforces that public flags must have metadata
export type PublicFeatureFlag = {
  key: Extract<
    FeatureFlagKey,
    | 'IS_ANALYTICS_V2_ENABLED'
    | 'IS_ADVANCED_FILTERS_ENABLED'
    | 'IS_COMMAND_MENU_V2_ENABLED'
  >;
  metadata: FeatureFlagMetadata;
};

export const PUBLIC_FEATURE_FLAGS: PublicFeatureFlag[] = [
  {
    key: FeatureFlagKey.IsAnalyticsV2Enabled,
    metadata: {
      label: 'Analytics V2',
      description:
        'Enable the new version of analytics with enhanced features and improved performance',
      imageKey: 'workflows.png',
    },
  },
  {
    key: FeatureFlagKey.IsAdvancedFiltersEnabled,
    metadata: {
      label: 'Advanced Filters',
      description:
        'Enable advanced filtering capabilities across the application',
      imageKey: 'workflows.png',
    },
  },
  {
    key: FeatureFlagKey.IsCommandMenuV2Enabled,
    metadata: {
      label: 'Command Menu V2',
      description:
        'Enable the new command menu with improved search and navigation',
      imageKey: 'workflows.png',
    },
  },
];
