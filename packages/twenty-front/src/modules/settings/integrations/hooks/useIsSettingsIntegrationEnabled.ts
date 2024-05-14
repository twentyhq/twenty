import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

const getFeatureKey = (databaseKey: string) => {
  switch (databaseKey) {
    case 'airtable':
      return 'IS_AIRTABLE_INTEGRATION_ENABLED';
    case 'postgresql':
      return 'IS_POSTGRESQL_INTEGRATION_ENABLED';
    case 'stripe':
      return 'IS_STRIPE_INTEGRATION_ENABLED';
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
