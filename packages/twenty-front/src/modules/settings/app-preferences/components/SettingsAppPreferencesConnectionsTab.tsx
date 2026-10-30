import { SettingsAppPreferencesConnectionsTable } from '@/settings/app-preferences/components/SettingsAppPreferencesConnectionsTable';
import { SettingsApplicationConnectCard } from '@/settings/app-preferences/components/SettingsApplicationConnectCard';
import { useMyPersonalConnectedAccounts } from '@/settings/app-preferences/hooks/useMyPersonalConnectedAccounts';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { SettingsApplicationAddConnectionButton } from '@/settings/applications/components/SettingsApplicationAddConnectionButton';
import { SettingsApplicationConnectionProviderSection } from '@/settings/applications/components/SettingsApplicationConnectionProviderSection';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { canStartConnectionProviderAuthorization } from '@/settings/applications/utils/canStartConnectionProviderAuthorization';
import { useLingui } from '@lingui/react/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

const APP_CONNECTED_ACCOUNT_PROVIDERS: ReadonlySet<ConnectedAccountProvider> =
  new Set([ConnectedAccountProvider.APP]);

type SettingsAppPreferencesConnectionsTabProps = {
  applicationId: string;
  connectionProviders: ApplicationWithPreferences['connectionProviders'];
  connectionRedirectLocation: string;
};

export const SettingsAppPreferencesConnectionsTab = ({
  applicationId,
  connectionProviders,
  connectionRedirectLocation,
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
        const canStartAuthorization =
          canStartConnectionProviderAuthorization(provider);

        const providerConnections = personalAccounts.filter(
          (account) => account.connectionProviderId === provider.id,
        );

        return (
          <SettingsApplicationConnectionProviderSection
            key={provider.id}
            providerDisplayName={provider.displayName}
            providerLogoUrl={provider.logoUrl}
            description={t`Connect your own ${provider.displayName} account for this app to use on your behalf.`}
            shouldShowMissingCredentialsBanner={!canStartAuthorization}
          >
            {isDefined(error) ? (
              <SettingsApplicationLoadErrorBanner
                message={t`Your connections could not be loaded. Check your connection and try again.`}
                onRetry={() => refetch().catch(() => undefined)}
              />
            ) : loading || isNonEmptyArray(providerConnections) ? (
              <>
                <SettingsAppPreferencesConnectionsTable
                  applicationId={applicationId}
                  providerName={provider.name}
                  connections={providerConnections}
                  canStartAuthorization={canStartAuthorization}
                  isLoading={loading}
                />
                {canStartAuthorization && (
                  <SettingsApplicationAddConnectionButton
                    applicationId={applicationId}
                    providerName={provider.name}
                    redirectLocation={connectionRedirectLocation}
                  />
                )}
              </>
            ) : (
              canStartAuthorization && (
                <SettingsApplicationConnectCard
                  applicationId={applicationId}
                  connectionProvider={provider}
                  title={t`Connect with ${provider.displayName}`}
                  redirectLocation={connectionRedirectLocation}
                />
              )
            )}
          </SettingsApplicationConnectionProviderSection>
        );
      })}
    </>
  );
};
