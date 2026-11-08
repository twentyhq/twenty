import { useMyPersonalConnectedAccounts } from '@/settings/app-preferences/hooks/useMyPersonalConnectedAccounts';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { getApplicationPreferencesPostConnectPath } from '@/settings/app-preferences/utils/getApplicationPreferencesPostConnectPath';
import { SettingsAppConnectionsBody } from '@/settings/app-preferences/components/SettingsAppConnectionsBody';
import { SettingsApplicationConnectionProviderSection } from '@/settings/applications/components/SettingsApplicationConnectionProviderSection';
import { canStartConnectionProviderAuthorization } from '@/settings/applications/utils/canStartConnectionProviderAuthorization';
import { useLingui } from '@lingui/react/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const APP_CONNECTED_ACCOUNT_PROVIDERS: ReadonlySet<ConnectedAccountProvider> =
  new Set([ConnectedAccountProvider.APP]);

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
            <SettingsAppConnectionsBody
              applicationId={applicationId}
              connectionProvider={provider}
              connections={providerConnections}
              isLoading={loading}
              hasLoadError={isDefined(error)}
              onRetry={() => refetch().catch(() => undefined)}
              canStartAuthorization={canStartAuthorization}
              connectCardTitle={t`Connect with ${provider.displayName}`}
              redirectLocation={postConnectPath}
            />
          </SettingsApplicationConnectionProviderSection>
        );
      })}
    </>
  );
};
