import { useInstalledBuiltInAccountApps } from '@/settings/applications/hooks/useInstalledBuiltInAccountApps';

export const useInstalledBuiltInAccountApp = (
  builtInAccountAppId: string | undefined,
) =>
  useInstalledBuiltInAccountApps().find(
    (installedBuiltInAccountApp) =>
      installedBuiltInAccountApp.id === builtInAccountAppId,
  );
