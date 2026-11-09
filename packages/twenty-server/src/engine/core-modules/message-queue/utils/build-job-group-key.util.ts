export const buildJobGroupKey = ({
  workspaceId,
  jobGroupId,
}: {
  workspaceId: string;
  jobGroupId: string;
}): string => `group:${workspaceId}:${jobGroupId}`;
