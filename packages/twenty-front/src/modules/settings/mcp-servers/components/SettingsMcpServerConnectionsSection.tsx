import { useLingui } from '@lingui/react/macro';
import { ConnectedAccountProvider, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

import { SettingsAppConnectionsBody } from '@/settings/app-preferences/components/SettingsAppConnectionsBody';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
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
      <SettingsAppConnectionsBody
        applicationId={connectionProvider.applicationId}
        connectionProvider={connectionProvider}
        connections={connections}
        isLoading={loading}
        hasLoadError={isDefined(error)}
        onRetry={() => refetch().catch(() => undefined)}
        canStartAuthorization
        connectCardTitle={
          isShared
            ? t`Connect the shared account`
            : t`Sign in to use this server`
        }
        redirectLocation={redirectLocation}
      />
    </Section.Root>
  );
};
