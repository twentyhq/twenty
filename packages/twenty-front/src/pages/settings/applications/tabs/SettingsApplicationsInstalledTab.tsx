import { useInstalledApplications } from '@/applications/hooks/useInstalledApplications';
import { useInstalledNativeAccountApps } from '@/settings/applications/hooks/useInstalledNativeAccountApps';
import { SettingsApplicationsTable } from '~/pages/settings/applications/components/SettingsApplicationsTable';

export const SettingsApplicationsInstalledTab = () => {
  const installedApplications = useInstalledApplications();
  const installedNativeAccountApps = useInstalledNativeAccountApps();

  if (installedApplications.length === 0) {
    return null;
  }

  return (
    <SettingsApplicationsTable
      applications={installedApplications}
      nativeAccountApps={installedNativeAccountApps}
    />
  );
};
