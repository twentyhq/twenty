import { AppChip } from '@/applications/components/AppChip';
import { getApplicationDisplayName } from '@/applications/utils/getApplicationDisplayName';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAddBuiltInAccount } from '@/settings/app-preferences/hooks/useAddBuiltInAccount';
import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { useEnabledBuiltInAccountApps } from '@/settings/app-preferences/hooks/useEnabledBuiltInAccountApps';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { useTriggerAppOAuth } from '@/settings/applications/hooks/useTriggerAppOAuth';
import { canStartConnectionProviderAuthorization } from '@/settings/applications/utils/canStartConnectionProviderAuthorization';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

type SettingsAccountGroupsEmptyStateProps = {
  builtInAccountApp?: BuiltInAccountApp;
};

export const SettingsAccountGroupsEmptyState = ({
  builtInAccountApp,
}: SettingsAccountGroupsEmptyStateProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { enabledBuiltInAccountApps } = useEnabledBuiltInAccountApps();
  const { applicationsWithPreferences } = useApplicationsWithPreferences();
  const { addBuiltInAccount } = useAddBuiltInAccount();
  const { triggerAppOAuth } = useTriggerAppOAuth();

  const builtInAccountApps = isDefined(builtInAccountApp)
    ? [builtInAccountApp]
    : enabledBuiltInAccountApps;
  const applicationConnectionProviders = isDefined(builtInAccountApp)
    ? []
    : applicationsWithPreferences.flatMap(
        ({ application, connectionProviders }) =>
          connectionProviders
            .filter(canStartConnectionProviderAuthorization)
            .map((connectionProvider) => ({
              application,
              connectionProvider,
              hasSiblingProviders: connectionProviders.length > 1,
            })),
      );

  return (
    <StyledCardsContainer>
      {builtInAccountApps.map((app) => {
        const appName = t(app.name);

        return (
          <SettingsCard
            key={app.id}
            Icon={<app.Icon size={theme.icon.size.md} />}
            title={t`Connect with ${appName}`}
            onClick={() => addBuiltInAccount(app)}
          />
        );
      })}
      {applicationConnectionProviders.map(
        ({ application, connectionProvider, hasSiblingProviders }) => {
          const applicationName = getApplicationDisplayName({
            application,
            currentWorkspace,
          });
          const appName = hasSiblingProviders
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
                })
              }
            />
          );
        },
      )}
    </StyledCardsContainer>
  );
};
