import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { CONNECTION_VISIBILITY_BY_PROVIDER_SCOPE } from 'src/engine/core-modules/application/connection-provider/constants/connection-visibility-by-provider-scope.constant';
import {
  type ConnectedAccountEntity,
  type ConnectedAccountVisibility,
} from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export const assertConnectionVisibilityWithinProviderScopeOrThrow = ({
  connectionProvider,
  visibility,
  reconnectTarget,
}: {
  connectionProvider: Pick<
    ConnectionProviderEntity,
    'name' | 'displayName' | 'scope'
  >;
  visibility: ConnectedAccountVisibility;
  reconnectTarget: Pick<ConnectedAccountEntity, 'visibility'> | null;
}): void => {
  const isKeepingExistingVisibility =
    isDefined(reconnectTarget) && reconnectTarget.visibility === visibility;

  if (
    isKeepingExistingVisibility ||
    CONNECTION_VISIBILITY_BY_PROVIDER_SCOPE[connectionProvider.scope] ===
      visibility
  ) {
    return;
  }

  const providerDisplayName = connectionProvider.displayName;

  throw new ConnectionProviderException(
    `Connection provider "${connectionProvider.name}" has scope ${connectionProvider.scope} and does not accept ${visibility} connections`,
    ConnectionProviderExceptionCode.CONNECTION_VISIBILITY_NOT_ALLOWED,
    {
      userFriendlyMessage:
        connectionProvider.scope === 'USER'
          ? msg`${providerDisplayName} only supports personal connections.`
          : msg`${providerDisplayName} only supports connections shared with the workspace.`,
    },
  );
};
