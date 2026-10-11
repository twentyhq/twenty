import { msg } from '@lingui/core/macro';
import { type ConnectedAccountVisibility } from 'twenty-shared/types';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export const assertConnectionProviderVisibilityAllowed = ({
  provider,
  visibility,
  reconnectTarget,
}: {
  provider: Pick<ConnectionProviderEntity, 'allowedVisibilities'>;
  visibility: ConnectedAccountVisibility;
  reconnectTarget: Pick<ConnectedAccountEntity, 'visibility'> | null;
}): void => {
  // App updates must not prevent repairing an existing connection. Sharing
  // changes its audience and must still obey the current declaration.
  if (
    reconnectTarget?.visibility === visibility ||
    provider.allowedVisibilities.includes(visibility)
  ) {
    return;
  }

  throw new ConnectionProviderException(
    `The connection provider does not allow ${visibility} connections.`,
    ConnectionProviderExceptionCode.INVALID_REQUEST,
    {
      userFriendlyMessage:
        visibility === 'user'
          ? msg`This provider only supports connections shared with the workspace.`
          : msg`This provider only supports personal connections.`,
    },
  );
};
