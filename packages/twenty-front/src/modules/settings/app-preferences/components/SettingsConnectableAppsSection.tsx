import { useConnectableAppStatusesById } from '@/settings/app-preferences/hooks/useConnectableAppStatusesById';
import { useConnectableApps } from '@/settings/app-preferences/hooks/useConnectableApps';
import { SettingsApplicationsTable } from '@/settings/applications/components/SettingsApplicationsTable';
import { useLingui } from '@lingui/react/macro';

export const SettingsConnectableAppsSection = () => {
  const { t } = useLingui();
  const { connectableApps, isLoading } = useConnectableApps();
  const connectableAppStatusesById =
    useConnectableAppStatusesById(connectableApps);

  return (
    <SettingsApplicationsTable
      title={t`Apps`}
      description={t`Choose your preferences for the apps installed on your workspace by the admin`}
      applications={[]}
      builtInApps={[]}
      connectableApps={connectableApps}
      linkTarget="applicationPreferences"
      middleColumn="status"
      statusesById={connectableAppStatusesById}
      isLoading={isLoading}
    />
  );
};
