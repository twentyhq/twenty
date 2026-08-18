export const buildWorkspaceDeletionUninstallHookPayload = ({
  applicationVersion,
  applicationUniversalIdentifier,
  workspaceId,
  workspaceDeletedAt,
}: {
  applicationVersion: string | null;
  applicationUniversalIdentifier: string;
  workspaceId: string;
  workspaceDeletedAt: Date;
}) => ({
  version: applicationVersion ?? undefined,
  idempotencyKey: `workspace-deletion:${workspaceId}:${workspaceDeletedAt.toISOString()}:${applicationUniversalIdentifier}`,
});
