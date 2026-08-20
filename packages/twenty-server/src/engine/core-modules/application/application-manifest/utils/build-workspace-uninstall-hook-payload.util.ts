export type WorkspaceUninstallHookRequestType =
  | 'workspace-deletion'
  | 'workspace-suspension';

export type UninstallHookPayload = {
  version?: string;
  idempotencyKey?: string;
};

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
}): UninstallHookPayload => ({
  version: applicationVersion ?? undefined,
  idempotencyKey: `${workspaceUninstallHookRequestType}:${workspaceId}:${uninstallRequestedAt.toISOString()}:${applicationUniversalIdentifier}`,
});
