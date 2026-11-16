import { isDefined } from 'twenty-shared/utils';

export const isServerAdminAccessAllowedFromWorkspace = ({
  workspaceId,
  serverAdminWorkspaceId,
}: {
  workspaceId: string | undefined;
  serverAdminWorkspaceId: string | undefined;
}): boolean =>
  !isDefined(serverAdminWorkspaceId) ||
  workspaceId === serverAdminWorkspaceId.toLowerCase();
