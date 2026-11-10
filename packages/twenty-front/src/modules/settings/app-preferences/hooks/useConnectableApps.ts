import { useMarketplaceApps } from '@/marketplace/hooks/useMarketplaceApps';
import { isConnectableApp } from '@/settings/app-preferences/utils/isConnectableApp';
import { isDefined } from 'twenty-shared/utils';

export const useConnectableApps = () => {
  const { data, isLoading, error, refetch } = useMarketplaceApps();

  return {
    connectableApps: data.filter(isConnectableApp),
    isLoading,
    hasConnectableAppsLoadError: isDefined(error),
    refetchConnectableApps: () => refetch().catch(() => undefined),
  };
};
