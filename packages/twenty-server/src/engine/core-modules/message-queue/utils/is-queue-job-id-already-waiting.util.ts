import { getQueueJobIdPrefix } from 'src/engine/core-modules/message-queue/utils/get-queue-job-id-prefix.util';

export const isQueueJobIdAlreadyWaiting = ({
  waitingJobIds,
  jobIdOrPrefix,
}: {
  waitingJobIds: string[];
  jobIdOrPrefix: string;
}): boolean =>
  waitingJobIds.some(
    (waitingJobId) =>
      waitingJobId === jobIdOrPrefix ||
      getQueueJobIdPrefix(waitingJobId) === jobIdOrPrefix,
  );
