import { useListenToQueueJob } from '@/queue-job/hooks/useListenToQueueJob';
import { type TrackedJobStatus } from '@/queue-job/types/TrackedJobStatus';
import { isTerminalJobState } from '@/queue-job/utils/isTerminalJobState';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseTrackedQueueJobArgs = {
  runningJobId?: string;
  onQueueJobSettled: (jobStatus: TrackedJobStatus) => void | Promise<void>;
};

export const useTrackedQueueJob = ({
  runningJobId,
  onQueueJobSettled,
}: UseTrackedQueueJobArgs) => {
  const [triggeredJobId, setTriggeredJobId] = useState<string>();
  const [settledJobId, setSettledJobId] = useState<string>();

  const trackedJobId = triggeredJobId ?? runningJobId;
  const activeJobId =
    isDefined(trackedJobId) && trackedJobId !== settledJobId
      ? trackedJobId
      : undefined;

  const handleQueueJobEvent = useCallback(
    (jobStatus: TrackedJobStatus) => {
      if (!isTerminalJobState(jobStatus.state)) {
        return;
      }

      setSettledJobId(jobStatus.jobId);
      setTriggeredJobId((currentTriggeredJobId) =>
        currentTriggeredJobId === jobStatus.jobId
          ? undefined
          : currentTriggeredJobId,
      );
      void onQueueJobSettled(jobStatus);
    },
    [onQueueJobSettled],
  );

  useListenToQueueJob({
    jobId: activeJobId,
    onQueueJobEvent: handleQueueJobEvent,
  });

  const trackJob = (jobId?: string) => {
    setSettledJobId(undefined);
    setTriggeredJobId(jobId);
  };

  return { activeJobId, trackJob };
};
