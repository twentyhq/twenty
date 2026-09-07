import { useListenToQueueJob } from '@/queue-job/hooks/useListenToQueueJob';
import { type TrackedJobStatus } from '@/queue-job/types/TrackedJobStatus';
import { isTerminalJobState } from '@/queue-job/utils/isTerminalJobState';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type TrackedQueueJob<TContext> = {
  jobId: string;
  context: TContext;
};

type UseTrackedQueueJobArgs<TContext> = {
  runningJob?: TrackedQueueJob<TContext>;
  onQueueJobSettled: (
    jobStatus: TrackedJobStatus,
    context: TContext,
  ) => void | Promise<void>;
};

export const useTrackedQueueJob = <TContext>({
  runningJob,
  onQueueJobSettled,
}: UseTrackedQueueJobArgs<TContext>) => {
  const [triggeredJob, setTriggeredJob] = useState<TrackedQueueJob<TContext>>();
  const [settledJobIds, setSettledJobIds] = useState<string[]>([]);

  const trackedJob = triggeredJob ?? runningJob;
  const activeJob =
    isDefined(trackedJob) && !settledJobIds.includes(trackedJob.jobId)
      ? trackedJob
      : undefined;
  const activeJobId = activeJob?.jobId;
  const activeJobContext = activeJob?.context;

  const handleQueueJobEvent = useCallback(
    (jobStatus: TrackedJobStatus) => {
      if (
        !isTerminalJobState(jobStatus.state) ||
        !isDefined(activeJobId) ||
        !isDefined(activeJobContext)
      ) {
        return;
      }

      setSettledJobIds((currentSettledJobIds) => [
        ...currentSettledJobIds,
        jobStatus.jobId,
      ]);
      setTriggeredJob((currentTriggeredJob) =>
        currentTriggeredJob?.jobId === jobStatus.jobId
          ? undefined
          : currentTriggeredJob,
      );
      void onQueueJobSettled(jobStatus, activeJobContext);
    },
    [activeJobContext, activeJobId, onQueueJobSettled],
  );

  useListenToQueueJob({
    jobId: activeJobId,
    onQueueJobEvent: handleQueueJobEvent,
  });

  const trackJob = (job: TrackedQueueJob<TContext>) => {
    setTriggeredJob(job);
  };

  return { activeJobId, trackJob };
};
