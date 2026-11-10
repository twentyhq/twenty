import { useMarketplaceApps } from '@/marketplace/hooks/useMarketplaceApps';
import { isConnectableApp } from '@/settings/app-preferences/utils/isConnectableApp';

export const useConnectableApps = () => {
  const { data, isLoading } = useMarketplaceApps();

  return {
    connectableApps: data.filter(isConnectableApp),
    isLoading,
  };
};
