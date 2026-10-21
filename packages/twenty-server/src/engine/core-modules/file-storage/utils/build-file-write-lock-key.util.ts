export const buildFileWriteLockKey = ({
  workspaceId,
  applicationId,
  filePath,
}: {
  workspaceId: string;
  applicationId: string;
  filePath: string;
}): string => `file-write:${workspaceId}:${applicationId}:${filePath}`;
