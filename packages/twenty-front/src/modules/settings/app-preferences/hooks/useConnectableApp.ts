import { useConnectableApps } from '@/settings/app-preferences/hooks/useConnectableApps';
import { isDefined } from 'twenty-shared/utils';

export const useConnectableApp = (applicationId: string | undefined) => {
  const { connectableApps, ...connectableAppsState } = useConnectableApps();

  const connectableApp = connectableApps.find(({ id }) => id === applicationId);

  return {
    connectableApp,
    isConnectableAppNotFound:
      !isDefined(connectableApp) &&
      !connectableAppsState.isLoading &&
      !connectableAppsState.hasConnectableAppsLoadError,
    ...connectableAppsState,
  };
};
