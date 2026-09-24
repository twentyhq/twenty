// BullMQ job ids are queue-global, so the workspace prefix is what keeps one
// workspace from reading or overwriting another workspace's job
export const buildQueueJobId = ({
  workspaceId,
  jobId,
}: {
  workspaceId: string;
  jobId: string;
}): string => `${workspaceId}.${jobId}`;
