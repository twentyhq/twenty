import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { isApplicationConnectionReconnectNeeded } from '@/settings/applications/utils/isApplicationConnectionReconnectNeeded';
import { isDefined } from 'twenty-shared/utils';
import { type ApplicationConnectionProviderOAuthConfig } from '~/generated-metadata/graphql';

type ReconnectableConnectionProvider = {
  oauth?: Pick<
    ApplicationConnectionProviderOAuthConfig,
    'isClientCredentialsConfigured'
  > | null;
};

// Gates the Reconnect action only; badges use isApplicationConnectionReconnectNeeded
// so a broken connection still shows when OAuth is not set up
export const canReconnectApplicationConnection = ({
  connection,
  provider,
}: {
  connection: Partial<Pick<ConnectedAccount, 'authFailedAt' | 'archivedAt'>>;
  provider: ReconnectableConnectionProvider | undefined;
}): boolean =>
  isDefined(provider) &&
  (provider.oauth?.isClientCredentialsConfigured ?? false) &&
  isApplicationConnectionReconnectNeeded(connection);
