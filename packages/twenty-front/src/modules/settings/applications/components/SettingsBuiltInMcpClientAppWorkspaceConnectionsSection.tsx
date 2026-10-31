import { useInstalledApplications } from '@/applications/hooks/useInstalledApplications';
import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';
import { SettingsApplicationsTable } from '@/settings/applications/components/SettingsApplicationsTable';
import { isInstalledByBuiltInMcpClientApp } from '@/settings/applications/utils/isInstalledByBuiltInMcpClientApp';
import { useLingui } from '@lingui/react/macro';

type SettingsBuiltInMcpClientAppWorkspaceConnectionsSectionProps = {
  builtInMcpClientApp: BuiltInMcpClientApp;
};

export const SettingsBuiltInMcpClientAppWorkspaceConnectionsSection = ({
  builtInMcpClientApp,
}: SettingsBuiltInMcpClientAppWorkspaceConnectionsSectionProps) => {
  const { t } = useLingui();
  const connectionApplications = useInstalledApplications().filter(
    (application) =>
      isInstalledByBuiltInMcpClientApp({ application, builtInMcpClientApp }),
  );

  if (connectionApplications.length === 0) {
    return null;
  }

  return (
    <SettingsApplicationsTable
      title={t`Connections in this workspace`}
      description={t`Each one is a member's connection and can be uninstalled from its page.`}
      applications={connectionApplications}
      builtInApps={[]}
      linkTarget="applicationDetail"
      middleColumn="type"
    />
  );
};
