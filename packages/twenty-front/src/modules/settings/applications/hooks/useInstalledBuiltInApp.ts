import { useInstalledBuiltInApps } from '@/settings/applications/hooks/useInstalledBuiltInApps';

export const useInstalledBuiltInApp = (builtInAppId: string | undefined) =>
  useInstalledBuiltInApps().find(
    (installedBuiltInApp) => installedBuiltInApp.id === builtInAppId,
  );
