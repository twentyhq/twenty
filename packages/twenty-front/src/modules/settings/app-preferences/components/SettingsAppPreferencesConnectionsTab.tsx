import { useMyPersonalConnectedAccounts } from '@/settings/app-preferences/hooks/useMyPersonalConnectedAccounts';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { getApplicationPreferencesPostConnectPath } from '@/settings/app-preferences/utils/getApplicationPreferencesPostConnectPath';
import { SettingsApplicationConnectionProviderSection } from '@/settings/applications/components/SettingsApplicationConnectionProviderSection';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsApplicationProviderConnections } from '@/settings/applications/components/SettingsApplicationProviderConnections';
import { APP_CONNECTED_ACCOUNT_PROVIDERS } from '@/settings/applications/constants/AppConnectedAccountProviders';
import { canStartConnectionProviderAuthorization } from '@/settings/applications/utils/canStartConnectionProviderAuthorization';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

type SettingsAppPreferencesConnectionsTabProps = {
  applicationId: string;
  connectionProviders: ApplicationWithPreferences['connectionProviders'];
  settingsMenuItems: ApplicationWithPreferences['settingsMenuItems'];
};

export const SettingsAppPreferencesConnectionsTab = ({
  applicationId,
  connectionProviders,
  settingsMenuItems,
}: SettingsAppPreferencesConnectionsTabProps) => {
  const { t } = useLingui();
  const postConnectPath = getApplicationPreferencesPostConnectPath({
    applicationId,
    settingsMenuItems,
  });
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
            ) : (
              <SettingsApplicationProviderConnections
                applicationId={applicationId}
                connectionProvider={provider}
                connections={personalAccounts.filter(
                  (account) => account.connectionProviderId === provider.id,
                )}
                canStartAuthorization={canStartAuthorization}
                isLoading={loading}
                connectTitle={t`Connect with ${provider.displayName}`}
                redirectLocation={postConnectPath}
              />
            )}
          </SettingsApplicationConnectionProviderSection>
        );
      })}
    </>
  );
};
