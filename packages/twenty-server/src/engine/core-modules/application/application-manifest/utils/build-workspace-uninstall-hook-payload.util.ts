export type WorkspaceUninstallHookRequestType =
  | 'workspace-deletion'
  | 'workspace-suspension';

export const buildWorkspaceUninstallHookPayload = ({
  applicationVersion,
  applicationUniversalIdentifier,
  workspaceId,
  workspaceRequestAt,
  workspaceUninstallHookRequestType,
}: {
  applicationVersion: string | null;
  applicationUniversalIdentifier: string;
  workspaceId: string;
  workspaceRequestAt: Date;
  workspaceUninstallHookRequestType: WorkspaceUninstallHookRequestType;
}) => ({
  version: applicationVersion ?? undefined,
  idempotencyKey: `${workspaceUninstallHookRequestType}:${workspaceId}:${workspaceRequestAt.toISOString()}:${applicationUniversalIdentifier}`,
});
