import { useMyPersonalConnectedAccounts } from '@/settings/app-preferences/hooks/useMyPersonalConnectedAccounts';
import { SettingsApplicationConnectionProviderSection } from '@/settings/applications/components/SettingsApplicationConnectionProviderSection';
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
      description={t`This server asks each member to sign in with their own account.`}
      shouldShowMissingCredentialsBanner={!canStartAuthorization}
    >
      <SettingsApplicationProviderConnections
        applicationId={connectionProvider.applicationId}
        connectionProvider={connectionProvider}
        connections={accounts.filter(
          (account) => account.connectionProviderId === connectionProvider.id,
        )}
        canStartAuthorization={canStartAuthorization}
        isLoading={loading}
        hasLoadError={isDefined(error)}
        onRetry={() => refetch().catch(() => undefined)}
        connectTitle={t`Sign in to use this server`}
        redirectLocation={getSettingsPath(SettingsPath.AiMcpServerDetail, {
          mcpServerId,
        })}
      />
    </SettingsApplicationConnectionProviderSection>
  );
};
