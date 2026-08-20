export type UninstallHookPayload = {
  version?: string;
  idempotencyKey?: string;
};

export const buildWorkspaceUninstallHookPayload = ({
  applicationVersion,
  applicationUniversalIdentifier,
  workspaceId,
  uninstallRequestedAt,
}: {
  applicationVersion: string | null;
  applicationUniversalIdentifier: string;
  workspaceId: string;
  uninstallRequestedAt: Date;
}): UninstallHookPayload => ({
  version: applicationVersion ?? undefined,
  idempotencyKey: `workspace-deletion:${workspaceId}:${uninstallRequestedAt.toISOString()}:${applicationUniversalIdentifier}`,
});
