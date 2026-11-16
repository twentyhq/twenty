import { isDefined } from 'twenty-shared/utils';

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

  return workspaceId === serverAdminWorkspaceId.toLowerCase();
};
