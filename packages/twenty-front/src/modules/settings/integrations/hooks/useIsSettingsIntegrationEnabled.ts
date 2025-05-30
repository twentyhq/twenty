import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';

const getFeatureKey = (databaseKey: string): FeatureFlagKey | null => {
  switch (databaseKey) {
    case 'airtable':
      return FeatureFlagKey.IS_AIRTABLE_INTEGRATION_ENABLED;
    case 'postgresql':
      return FeatureFlagKey.IS_POSTGRESQL_INTEGRATION_ENABLED;
    case 'stripe':
      return FeatureFlagKey.IS_STRIPE_INTEGRATION_ENABLED;
    default:
      return null;
  }
};

export const useIsSettingsIntegrationEnabled = (
  databaseKey: string,
): boolean => {
  const featureKey = getFeatureKey(databaseKey);
  return useIsFeatureEnabled(featureKey);
};
