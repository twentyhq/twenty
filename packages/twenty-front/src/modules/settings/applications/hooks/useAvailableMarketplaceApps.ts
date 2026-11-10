import { useMarketplaceApps } from '@/marketplace/hooks/useMarketplaceApps';
import { isConnectableApp } from '@/settings/app-preferences/utils/isConnectableApp';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useAvailableMarketplaceApps = () => {
  const { data, isLoading, error, refetch } = useMarketplaceApps();
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );

  return {
    availableMarketplaceApps: isAppPreferencesEnabled
      ? data
      : data.filter((marketplaceApp) => !isConnectableApp(marketplaceApp)),
    isLoading,
    error,
    refetch,
  };
};
