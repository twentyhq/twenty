import { BUILT_IN_MCP_CLIENT_APPS } from '@/settings/app-preferences/constants/BuiltInMcpClientApps';
import { useBuiltInMcpClientAppStatusesById } from '@/settings/app-preferences/hooks/useBuiltInMcpClientAppStatusesById';
import { SettingsApplicationsTable } from '@/settings/applications/components/SettingsApplicationsTable';
import { useLingui } from '@lingui/react/macro';

export const SettingsBuiltInMcpClientAppsSection = () => {
  const { t } = useLingui();
  const builtInMcpClientAppStatusesById = useBuiltInMcpClientAppStatusesById();

  return (
    <SettingsApplicationsTable
      title={t`Apps`}
      description={t`Choose your preferences for the apps installed on your workspace by the admin`}
      applications={[]}
      builtInApps={BUILT_IN_MCP_CLIENT_APPS}
      linkTarget="applicationPreferences"
      middleColumn="status"
      statusesById={builtInMcpClientAppStatusesById}
    />
  );
};
