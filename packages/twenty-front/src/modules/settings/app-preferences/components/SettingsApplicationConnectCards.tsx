import { getApplicationDisplayName } from '@/applications/utils/getApplicationDisplayName';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsApplicationConnectCard } from '@/settings/app-preferences/components/SettingsApplicationConnectCard';
import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { canStartConnectionProviderAuthorization } from '@/settings/applications/utils/canStartConnectionProviderAuthorization';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';

export const SettingsApplicationConnectCards = () => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { applicationsWithPreferences } = useApplicationsWithPreferences();

  const connectableProviders = applicationsWithPreferences.flatMap(
    ({ application, connectionProviders }) => {
      const authorizableProviders = connectionProviders.filter(
        canStartConnectionProviderAuthorization,
      );

      return authorizableProviders.map((connectionProvider) => ({
        application,
        connectionProvider,
        hasMultipleConnectionProviders: authorizableProviders.length > 1,
      }));
    },
  );

  return (
    <>
      {connectableProviders.map(
        ({
          application,
          connectionProvider,
          hasMultipleConnectionProviders,
        }) => {
          const applicationName = getApplicationDisplayName({
            application,
            currentWorkspace,
          });
          const appName = hasMultipleConnectionProviders
            ? `${applicationName} (${connectionProvider.displayName})`
            : applicationName;

          return (
            <SettingsApplicationConnectCard
              key={connectionProvider.id}
              applicationId={application.id}
              connectionProvider={connectionProvider}
              title={t`Connect with ${appName}`}
            />
          );
        },
      )}
    </>
  );
};
