export type WorkspaceUninstallHookRequestType =
  | 'workspace-deletion'
  | 'workspace-suspension';

export const buildWorkspaceUninstallHookPayload = ({
  applicationVersion,
  applicationUniversalIdentifier,
  workspaceId,
  uninstallRequestedAt,
  workspaceUninstallHookRequestType,
}: {
  applicationVersion: string | null;
  applicationUniversalIdentifier: string;
  workspaceId: string;
  uninstallRequestedAt: Date;
  workspaceUninstallHookRequestType: WorkspaceUninstallHookRequestType;
}) => ({
  version: applicationVersion ?? undefined,
  idempotencyKey: `${workspaceUninstallHookRequestType}:${workspaceId}:${uninstallRequestedAt.toISOString()}:${applicationUniversalIdentifier}`,
});
