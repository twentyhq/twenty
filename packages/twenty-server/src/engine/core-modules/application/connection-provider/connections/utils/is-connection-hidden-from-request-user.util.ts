import { isDefined } from 'twenty-shared/utils';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

// A request-user can only see or act on their own user-visibility
// credentials. Workspace-shared ones are open to anyone in the workspace,
// and cron has no request user, so it sees all.
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
