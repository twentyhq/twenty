import { useInstalledNativeAccountApps } from '@/settings/applications/hooks/useInstalledNativeAccountApps';

export const useInstalledNativeAccountApp = (
  nativeAccountAppId: string | undefined,
) =>
  useInstalledNativeAccountApps().find(
    (installedNativeAccountApp) =>
      installedNativeAccountApp.id === nativeAccountAppId,
  );
