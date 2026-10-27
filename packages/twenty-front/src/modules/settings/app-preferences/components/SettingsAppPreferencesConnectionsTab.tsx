import { SettingsAppPreferencesConnectionsTable } from '@/settings/app-preferences/components/SettingsAppPreferencesConnectionsTable';
import { useMyPersonalConnectedAccounts } from '@/settings/app-preferences/hooks/useMyPersonalConnectedAccounts';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { getApplicationPreferencesConnectionsPath } from '@/settings/app-preferences/utils/getApplicationPreferencesConnectionsPath';
import { SettingsApplicationAddConnectionButton } from '@/settings/applications/components/SettingsApplicationAddConnectionButton';
import { SettingsApplicationConnectionProviderSection } from '@/settings/applications/components/SettingsApplicationConnectionProviderSection';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
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
  const {
    accounts: personalAccounts,
    loading,
    error,
    refetch,
  } = useMyPersonalConnectedAccounts({
    providers: APP_CONNECTED_ACCOUNT_PROVIDERS,
  });

  return (
    <>
      {connectionProviders.map((provider) => {
        const isClientCredentialsConfigured =
          provider.oauth?.isClientCredentialsConfigured ?? false;

        const providerConnections = personalAccounts.filter(
          (account) => account.connectionProviderId === provider.id,
        );

        return (
          <SettingsApplicationConnectionProviderSection
            key={provider.id}
            providerDisplayName={provider.displayName}
            providerLogoUrl={provider.logoUrl}
            description={t`Connect your own ${provider.displayName} account for this app to use on your behalf.`}
            shouldShowMissingCredentialsBanner={!isClientCredentialsConfigured}
          >
            {isDefined(error) ? (
              <SettingsApplicationLoadErrorBanner
                message={t`Your connections could not be loaded. Check your connection and try again.`}
                onRetry={() => refetch().catch(() => undefined)}
              />
            ) : (
              <>
                {loading || isNonEmptyArray(providerConnections) ? (
                  <SettingsAppPreferencesConnectionsTable
                    applicationId={applicationId}
                    providerName={provider.name}
                    connections={providerConnections}
                    isClientCredentialsConfigured={
                      isClientCredentialsConfigured
                    }
                    isLoading={loading}
                  />
                ) : (
                  isClientCredentialsConfigured && (
                    <StyledEmptyState>{t`You have no ${provider.displayName} connection yet.`}</StyledEmptyState>
                  )
                )}
                {isClientCredentialsConfigured && (
                  <SettingsApplicationAddConnectionButton
                    applicationId={applicationId}
                    providerName={provider.name}
                    redirectLocation={getApplicationPreferencesConnectionsPath(
                      applicationId,
                    )}
                  />
                )}
              </>
            )}
          </SettingsApplicationConnectionProviderSection>
        );
      })}
    </>
  );
};
