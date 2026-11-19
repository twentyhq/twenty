import { useMyPersonalConnectedAccounts } from '@/settings/app-preferences/hooks/useMyPersonalConnectedAccounts';
import { SettingsApplicationConnectionProviderSection } from '@/settings/applications/components/SettingsApplicationConnectionProviderSection';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsApplicationProviderConnections } from '@/settings/applications/components/SettingsApplicationProviderConnections';
import { APP_CONNECTED_ACCOUNT_PROVIDERS } from '@/settings/applications/constants/AppConnectedAccountProviders';
import { canStartConnectionProviderAuthorization } from '@/settings/applications/utils/canStartConnectionProviderAuthorization';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { type ApplicationConnectionProviderFragmentFragment } from '~/generated-metadata/graphql';

type SettingsMcpServerConnectionsSectionProps = {
  mcpServerId: string;
  connectionProvider: ApplicationConnectionProviderFragmentFragment;
};

export const SettingsMcpServerConnectionsSection = ({
  mcpServerId,
  connectionProvider,
}: SettingsMcpServerConnectionsSectionProps) => {
  const { t } = useLingui();
  const { accounts, loading, error, refetch } = useMyPersonalConnectedAccounts({
    providers: APP_CONNECTED_ACCOUNT_PROVIDERS,
  });
  const canStartAuthorization =
    canStartConnectionProviderAuthorization(connectionProvider);

  return (
    <SettingsApplicationConnectionProviderSection
      providerDisplayName={connectionProvider.displayName}
      providerLogoUrl={connectionProvider.logoUrl}
      description={t`Connect your own ${connectionProvider.displayName} account for this server to use on your behalf.`}
      shouldShowMissingCredentialsBanner={!canStartAuthorization}
    >
      {isDefined(error) ? (
        <SettingsApplicationLoadErrorBanner
          message={t`Your connections could not be loaded. Check your connection and try again.`}
          onRetry={() => refetch().catch(() => undefined)}
        />
      ) : (
        <SettingsApplicationProviderConnections
          applicationId={connectionProvider.applicationId}
          connectionProvider={connectionProvider}
          connections={accounts.filter(
            (account) => account.connectionProviderId === connectionProvider.id,
          )}
          canStartAuthorization={canStartAuthorization}
          isLoading={loading}
          connectTitle={t`Connect with ${connectionProvider.displayName}`}
          redirectLocation={getSettingsPath(SettingsPath.AiMcpServerDetail, {
            mcpServerId,
          })}
        />
      )}
    </SettingsApplicationConnectionProviderSection>
  );
};
