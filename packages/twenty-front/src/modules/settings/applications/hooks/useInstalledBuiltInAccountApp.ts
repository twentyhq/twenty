import { useEnabledBuiltInAccountApps } from '@/settings/app-preferences/hooks/useEnabledBuiltInAccountApps';

export const useInstalledBuiltInAccountApp = (
  builtInAccountAppId: string | undefined,
) =>
  useEnabledBuiltInAccountApps().enabledBuiltInAccountApps.find(
    (enabledBuiltInAccountApp) =>
      enabledBuiltInAccountApp.id === builtInAccountAppId,
  );
