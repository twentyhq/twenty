import { useListenToQueueJob } from '@/queue-job/hooks/useListenToQueueJob';
import { type TrackedJobStatus } from '@/queue-job/types/TrackedJobStatus';
import { isTerminalJobState } from '@/queue-job/utils/isTerminalJobState';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type TrackedQueueJob<TContext> = {
  jobId: string;
  context: TContext;
  progress?: number;
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
  const [progressByJobId, setProgressByJobId] = useState<
    Record<string, number>
  >({});

  const trackedJob = triggeredJob ?? runningJob;
  const activeJob =
    isDefined(trackedJob) && !settledJobIds.includes(trackedJob.jobId)
      ? trackedJob
      : undefined;
  const activeJobId = activeJob?.jobId;
  const activeJobContext = activeJob?.context;
  const activeJobProgress = isDefined(activeJob)
    ? (progressByJobId[activeJob.jobId] ?? activeJob.progress)
    : undefined;

  const handleQueueJobEvent = useCallback(
    (jobStatus: TrackedJobStatus) => {
      if (!isDefined(activeJobId) || !isDefined(activeJobContext)) {
        return;
      }

      if (isDefined(jobStatus.progress)) {
        const progress = jobStatus.progress;

        setProgressByJobId((currentProgressByJobId) => ({
          ...currentProgressByJobId,
          [jobStatus.jobId]: progress,
        }));
      }

      if (!isTerminalJobState(jobStatus.state)) {
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

  return { activeJobId, activeJobProgress, trackJob };
};
