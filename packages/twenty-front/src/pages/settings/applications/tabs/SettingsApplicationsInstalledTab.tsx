import { useInstalledApplications } from '@/applications/hooks/useInstalledApplications';
import { useInstalledBuiltInAccountApps } from '@/settings/applications/hooks/useInstalledBuiltInAccountApps';
import { SettingsApplicationsTable } from '@/settings/applications/components/SettingsApplicationsTable';
import { useLingui } from '@lingui/react/macro';

export const SettingsApplicationsInstalledTab = () => {
  const { t } = useLingui();
  const installedApplications = useInstalledApplications();
  const installedBuiltInAccountApps = useInstalledBuiltInAccountApps();

  if (installedApplications.length === 0) {
    return null;
  }

  return (
    <SettingsApplicationsTable
      title={t`Installed apps`}
      description={t`All the applications currently installed on this workspace`}
      applications={installedApplications}
      builtInAccountApps={installedBuiltInAccountApps}
      variant="workspace"
    />
  );
};
