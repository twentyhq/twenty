import { useLingui } from '@lingui/react/macro';
import { ConnectedAccountProvider, SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

import { SettingsAppPreferencesConnectionsTable } from '@/settings/app-preferences/components/SettingsAppPreferencesConnectionsTable';
import { SettingsApplicationConnectCard } from '@/settings/app-preferences/components/SettingsApplicationConnectCard';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { SettingsApplicationAddConnectionButton } from '@/settings/applications/components/SettingsApplicationAddConnectionButton';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import {
  type ApplicationConnectionProviderFragmentFragment,
  ConnectionProviderScope,
} from '~/generated-metadata/graphql';

const APP_CONNECTED_ACCOUNT_PROVIDERS: ReadonlySet<ConnectedAccountProvider> =
  new Set([ConnectedAccountProvider.APP]);

type SettingsMcpServerConnectionsSectionProps = {
  mcpServerId: string;
  connectionProvider: Pick<
    ApplicationConnectionProviderFragmentFragment,
    'id' | 'applicationId' | 'name' | 'logoUrl'
  >;
  signInScope: ConnectionProviderScope;
};

export const SettingsMcpServerConnectionsSection = ({
  mcpServerId,
  connectionProvider,
  signInScope,
}: SettingsMcpServerConnectionsSectionProps) => {
  const { t } = useLingui();
  // Lists what the caller may use: their own accounts, or the provider's shared one
  const { accounts, loading, error, refetch } = useMyConnectedAccounts({
    providers: APP_CONNECTED_ACCOUNT_PROVIDERS,
  });
  const isShared = signInScope === ConnectionProviderScope.WORKSPACE;

  const connections = accounts.filter(
    (account) => account.connectionProviderId === connectionProvider.id,
  );
  const redirectLocation = getSettingsPath(SettingsPath.AiMcpServerDetail, {
    mcpServerId,
  });

  return (
    <Section.Root>
      <Section.Header
        title={isShared ? t`Shared connection` : t`Your connection`}
        description={
          isShared
            ? t`Every call to this server uses this account. Only admins can connect it.`
            : t`This server asks each member to sign in with their own account. Twenty registers itself with the server automatically.`
        }
      />
      {isDefined(error) ? (
        <SettingsApplicationLoadErrorBanner
          message={t`Your connections could not be loaded. Check your connection and try again.`}
          onRetry={() => refetch().catch(() => undefined)}
        />
      ) : loading || isNonEmptyArray(connections) ? (
        <>
          <SettingsAppPreferencesConnectionsTable
            applicationId={connectionProvider.applicationId}
            providerName={connectionProvider.name}
            connections={connections}
            canStartAuthorization
            isLoading={loading}
            reconnectRedirectLocation={redirectLocation}
          />
          <SettingsApplicationAddConnectionButton
            applicationId={connectionProvider.applicationId}
            providerName={connectionProvider.name}
            redirectLocation={redirectLocation}
          />
        </>
      ) : (
        <SettingsApplicationConnectCard
          applicationId={connectionProvider.applicationId}
          connectionProvider={connectionProvider}
          title={
            isShared
              ? t`Connect the shared account`
              : t`Sign in to use this server`
          }
          redirectLocation={redirectLocation}
        />
      )}
    </Section.Root>
  );
};
