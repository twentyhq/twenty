import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';

const getFeatureKey = (databaseKey: string): FeatureFlagKey | null => {
  switch (databaseKey) {
    case 'airtable':
      return FeatureFlagKey.IsAirtableIntegrationEnabled;
    case 'postgresql':
      return FeatureFlagKey.IsPostgreSqlIntegrationEnabled;
    case 'stripe':
      return FeatureFlagKey.IsStripeIntegrationEnabled;
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
