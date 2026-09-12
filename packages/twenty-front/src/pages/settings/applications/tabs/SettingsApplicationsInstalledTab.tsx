import { useInstalledApplications } from '@/applications/hooks/useInstalledApplications';
import { SettingsApplicationsTable } from '~/pages/settings/applications/components/SettingsApplicationsTable';

export const SettingsApplicationsInstalledTab = () => {
  const installedApplications = useInstalledApplications();

  if (installedApplications.length === 0) {
    return null;
  }

  return <SettingsApplicationsTable applications={installedApplications} />;
};
