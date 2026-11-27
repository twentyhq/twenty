export const extractJobIdFromQueueJobId = ({
  workspaceId,
  queueJobId,
}: {
  workspaceId: string;
  queueJobId: string;
}): string => {
  const workspacePrefix = `${workspaceId}.`;

  return queueJobId.startsWith(workspacePrefix)
    ? queueJobId.slice(workspacePrefix.length)
    : queueJobId;
};
