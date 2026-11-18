export const isServerAdminWorkspace = ({
  workspaceId,
  serverAdminWorkspaceId,
}: {
  workspaceId: string | undefined;
  serverAdminWorkspaceId: string;
}): boolean => workspaceId === serverAdminWorkspaceId.toLowerCase();
