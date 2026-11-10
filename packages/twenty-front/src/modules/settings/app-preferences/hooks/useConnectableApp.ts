import { useConnectableApps } from '@/settings/app-preferences/hooks/useConnectableApps';

export const useConnectableApp = (applicationId: string | undefined) => {
  const { connectableApps, ...connectableAppsState } = useConnectableApps();

  return {
    connectableApp: connectableApps.find(({ id }) => id === applicationId),
    ...connectableAppsState,
  };
};
