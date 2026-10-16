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
  const isKeepingExistingScope =
    isDefined(reconnectTarget) && reconnectTarget.scope === scope;

  if (isKeepingExistingScope || connectionProvider.scope === scope) {
    return;
  }

  const providerDisplayName = connectionProvider.displayName;

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
