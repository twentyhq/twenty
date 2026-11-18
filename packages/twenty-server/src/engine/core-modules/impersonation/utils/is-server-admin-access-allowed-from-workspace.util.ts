import { isDefined } from 'twenty-shared/utils';

import { isServerAdminWorkspace } from 'src/engine/core-modules/impersonation/utils/is-server-admin-workspace.util';

export const isServerAdminAccessAllowedFromWorkspace = ({
  workspaceId,
  serverAdminWorkspaceId,
}: {
  workspaceId: string | undefined;
  serverAdminWorkspaceId: string | undefined;
}): boolean => {
  if (!isDefined(serverAdminWorkspaceId)) {
    return true;
  }

  return isServerAdminWorkspace({ workspaceId, serverAdminWorkspaceId });
};
