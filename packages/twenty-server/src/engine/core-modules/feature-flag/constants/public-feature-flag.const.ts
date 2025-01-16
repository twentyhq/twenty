import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

export type PublicFeatureFlag = Extract<
  FeatureFlagKey,
  | 'IS_ANALYTICS_V2_ENABLED'
  | 'IS_ADVANCED_FILTERS_ENABLED'
  | 'IS_COMMAND_MENU_V2_ENABLED'
>;

export const PUBLIC_FEATURE_FLAGS: PublicFeatureFlag[] = [
  FeatureFlagKey.IsAnalyticsV2Enabled,
  FeatureFlagKey.IsAdvancedFiltersEnabled,
  FeatureFlagKey.IsCommandMenuV2Enabled,
];
