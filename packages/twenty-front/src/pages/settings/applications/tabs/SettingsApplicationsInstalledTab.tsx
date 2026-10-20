import { useInstalledApplications } from '@/applications/hooks/useInstalledApplications';
import { useInstalledBuiltInAccountApps } from '@/settings/applications/hooks/useInstalledBuiltInAccountApps';
import { SettingsApplicationsTable } from '~/pages/settings/applications/components/SettingsApplicationsTable';

export const SettingsApplicationsInstalledTab = () => {
  const installedApplications = useInstalledApplications();
  const installedBuiltInAccountApps = useInstalledBuiltInAccountApps();

  if (installedApplications.length === 0) {
    return null;
  }

  return (
    <SettingsApplicationsTable
      applications={installedApplications}
      builtInAccountApps={installedBuiltInAccountApps}
    />
  );
};
