import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import {
  type ConnectedAccountEntity,
  type ConnectedAccountScope,
} from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export const assertConnectionScopeAllowedByProviderOrThrow = ({
  connectionProvider,
  scope,
  reconnectTarget,
}: {
  connectionProvider: Pick<
    ConnectionProviderEntity,
    'name' | 'displayName' | 'scope'
  >;
  scope: ConnectedAccountScope;
  reconnectTarget: Pick<ConnectedAccountEntity, 'scope'> | null;
}): void => {
  const providerDisplayName = connectionProvider.displayName;

  // A reconnect keeps the row's scope even if the app changed the provider's scope since.
  if (isDefined(reconnectTarget)) {
    if (reconnectTarget.scope === scope) {
      return;
    }

    throw new ConnectionProviderException(
      `Cannot reconnect a ${reconnectTarget.scope} connection of provider "${connectionProvider.name}" as ${scope}: a reconnect keeps the connection's scope`,
      ConnectionProviderExceptionCode.CONNECTION_SCOPE_NOT_ALLOWED,
      {
        userFriendlyMessage:
          reconnectTarget.scope === 'USER'
            ? msg`This ${providerDisplayName} connection is personal. Reconnecting keeps it personal.`
            : msg`This ${providerDisplayName} connection is shared with the workspace. Reconnecting keeps it shared.`,
      },
    );
  }

  if (connectionProvider.scope === scope) {
    return;
  }

  throw new ConnectionProviderException(
    `Connection provider "${connectionProvider.name}" has scope ${connectionProvider.scope} and does not accept ${scope} connections`,
    ConnectionProviderExceptionCode.CONNECTION_SCOPE_NOT_ALLOWED,
    {
      userFriendlyMessage:
        connectionProvider.scope === 'USER'
          ? msg`${providerDisplayName} only supports personal connections.`
          : msg`${providerDisplayName} only supports connections shared with the workspace.`,
    },
  );
};
