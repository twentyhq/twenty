import { isDefined } from 'twenty-shared/utils';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

// Background executions carry no request user, so nothing is hidden from them.
export const isConnectionHiddenFromRequestUser = ({
  account,
  requestUserWorkspaceId,
}: {
  account: Pick<ConnectedAccountEntity, 'visibility' | 'userWorkspaceId'>;
  requestUserWorkspaceId: string | null;
}): boolean =>
  isDefined(requestUserWorkspaceId) &&
  account.visibility === 'user' &&
  account.userWorkspaceId !== requestUserWorkspaceId;
