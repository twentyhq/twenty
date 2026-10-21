import { SettingsAppPreferencesConnectionsTable } from '@/settings/app-preferences/components/SettingsAppPreferencesConnectionsTable';
import { useMyPersonalConnectedAccounts } from '@/settings/app-preferences/hooks/useMyPersonalConnectedAccounts';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { getApplicationPreferencesConnectionsPath } from '@/settings/app-preferences/utils/getApplicationPreferencesConnectionsPath';
import { SettingsApplicationAddConnectionButton } from '@/settings/applications/components/SettingsApplicationAddConnectionButton';
import { SettingsApplicationConnectionProviderSection } from '@/settings/applications/components/SettingsApplicationConnectionProviderSection';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme';

const APP_CONNECTED_ACCOUNT_PROVIDERS: ReadonlySet<ConnectedAccountProvider> =
  new Set([ConnectedAccountProvider.APP]);

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
`;

type SettingsAppPreferencesConnectionsTabProps = {
  applicationId: string;
  connectionProviders: ApplicationWithPreferences['connectionProviders'];
};

export const SettingsAppPreferencesConnectionsTab = ({
  applicationId,
  connectionProviders,
}: SettingsAppPreferencesConnectionsTabProps) => {
  const { t } = useLingui();
  const { accounts: personalAccounts, loading } =
    useMyPersonalConnectedAccounts({
      providers: APP_CONNECTED_ACCOUNT_PROVIDERS,
    });

  if (loading) {
    return null;
  }

  const redirectLocation =
    getApplicationPreferencesConnectionsPath(applicationId);

  return (
    <>
      {connectionProviders.map((provider) => {
        const isClientCredentialsConfigured =
          provider.oauth?.isClientCredentialsConfigured ?? false;

        const providerConnections = personalAccounts.filter(
          (account) => account.connectionProviderId === provider.id,
        );
        // Listed only for personal connections made before the provider became workspace-scoped
        const isWorkspaceProvider = provider.scope === 'WORKSPACE';
        const canAddConnection =
          !isWorkspaceProvider && isClientCredentialsConfigured;

        return (
          <SettingsApplicationConnectionProviderSection
            key={provider.id}
            providerDisplayName={provider.displayName}
            providerLogoUrl={provider.logoUrl}
            isClientCredentialsConfigured={isClientCredentialsConfigured}
            description={
              isWorkspaceProvider
                ? t`New connections for this app are shared with the workspace by an admin.`
                : t`Connect your own ${provider.displayName} account for this app to use on your behalf.`
            }
            shouldShowMissingCredentialsBanner={
              !isWorkspaceProvider || providerConnections.length > 0
            }
          >
            {providerConnections.length === 0 ? (
              canAddConnection && (
                <StyledEmptyState>{t`You have no ${provider.displayName} connection yet.`}</StyledEmptyState>
              )
            ) : (
              <SettingsAppPreferencesConnectionsTable
                applicationId={applicationId}
                providerName={provider.name}
                connections={providerConnections}
                isClientCredentialsConfigured={isClientCredentialsConfigured}
                redirectLocation={redirectLocation}
              />
            )}
            {canAddConnection && (
              <SettingsApplicationAddConnectionButton
                applicationId={applicationId}
                providerName={provider.name}
                scope="USER"
                redirectLocation={redirectLocation}
              />
            )}
          </SettingsApplicationConnectionProviderSection>
        );
      })}
    </>
  );
};
