import { useListenToQueueJob } from '@/queue-job/hooks/useListenToQueueJob';
import { isTerminalJobState } from '@/queue-job/utils/isTerminalJobState';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type JobStatus } from '~/generated-metadata/graphql';

type UseTrackedQueueJobArgs = {
  // A job the server reports as already in flight, so a page reload picks the
  // tracking back up instead of looking idle
  runningJobId?: string;
  onQueueJobSettled: (jobStatus: JobStatus) => void | Promise<void>;
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
    (jobStatus: JobStatus) => {
      if (!isTerminalJobState(jobStatus.state)) {
        return;
      }

      setSettledJobId(jobStatus.jobId);
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
