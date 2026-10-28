import { AppChip } from '@/applications/components/AppChip';
import { getApplicationDisplayName } from '@/applications/utils/getApplicationDisplayName';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { getApplicationPreferencesConnectionsPath } from '@/settings/app-preferences/utils/getApplicationPreferencesConnectionsPath';
import { useTriggerAppOAuth } from '@/settings/applications/hooks/useTriggerAppOAuth';
import { canStartConnectionProviderAuthorization } from '@/settings/applications/utils/canStartConnectionProviderAuthorization';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';

export const SettingsApplicationConnectCards = () => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { applicationsWithPreferences } = useApplicationsWithPreferences();
  const { triggerAppOAuth } = useTriggerAppOAuth();

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
            <SettingsCard
              key={connectionProvider.id}
              Icon={
                <AppChip applicationId={application.id} size="md" chipOnly />
              }
              title={t`Connect with ${appName}`}
              onClick={() =>
                triggerAppOAuth({
                  applicationId: application.id,
                  providerName: connectionProvider.name,
                  redirectLocation: getApplicationPreferencesConnectionsPath(
                    application.id,
                  ),
                })
              }
            />
          );
        },
      )}
    </>
  );
};
