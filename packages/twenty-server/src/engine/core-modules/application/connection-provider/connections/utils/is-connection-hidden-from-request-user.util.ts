import { isDefined } from 'twenty-shared/utils';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { isConnectedAccountUsableByCaller } from 'src/engine/metadata-modules/connected-account/utils/is-connected-account-usable-by-caller.util';

// Background executions carry no request user, so nothing is hidden from them.
export const isConnectionHiddenFromRequestUser = ({
  account,
  requestUserWorkspaceId,
}: {
  account: Pick<ConnectedAccountEntity, 'visibility' | 'userWorkspaceId'>;
  requestUserWorkspaceId: string | null;
}): boolean =>
  isDefined(requestUserWorkspaceId) &&
  !isConnectedAccountUsableByCaller({
    connectedAccount: account,
    userWorkspaceId: requestUserWorkspaceId,
  });
