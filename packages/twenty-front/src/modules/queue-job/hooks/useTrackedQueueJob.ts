import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { QUEUE_JOB_BROWSER_EVENT_NAME } from '@/queue-job/constants/QueueJobBrowserEventName';
import { useListenToQueueJob } from '@/queue-job/hooks/useListenToQueueJob';
import { type TrackedJobStatus } from '@/queue-job/types/TrackedJobStatus';
import { isTerminalJobState } from '@/queue-job/utils/isTerminalJobState';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { isNull } from '@sniptt/guards';
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
  fetchJobStatus?: (
    jobId: string,
    context: TContext,
  ) => Promise<TrackedJobStatus | null | undefined>;
};

export const useTrackedQueueJob = <TContext>({
  runningJob,
  onQueueJobSettled,
  fetchJobStatus,
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

  const stopTrackingJob = useCallback((jobId: string) => {
    setSettledJobIds((currentSettledJobIds) => [
      ...currentSettledJobIds,
      jobId,
    ]);
    setTriggeredJob((currentTriggeredJob) =>
      currentTriggeredJob?.jobId === jobId ? undefined : currentTriggeredJob,
    );
  }, []);

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

      stopTrackingJob(jobStatus.jobId);
      void onQueueJobSettled(jobStatus, activeJobContext);
    },
    [activeJobContext, activeJobId, onQueueJobSettled, stopTrackingJob],
  );

  useListenToQueueJob({
    jobId: activeJobId,
    onQueueJobEvent: handleQueueJobEvent,
  });

  const resyncActiveJob = useCallback(async () => {
    if (
      !isDefined(fetchJobStatus) ||
      !isDefined(activeJobId) ||
      !isDefined(activeJobContext)
    ) {
      return;
    }

    const jobStatus = await fetchJobStatus(activeJobId, activeJobContext).catch(
      () => undefined,
    );

    if (isNull(jobStatus)) {
      stopTrackingJob(activeJobId);
      return;
    }

    if (isDefined(jobStatus)) {
      dispatchBrowserEvent<TrackedJobStatus>(
        QUEUE_JOB_BROWSER_EVENT_NAME,
        jobStatus,
      );
    }
  }, [activeJobContext, activeJobId, fetchJobStatus, stopTrackingJob]);

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: resyncActiveJob,
  });

  const trackJob = (job: TrackedQueueJob<TContext>) => {
    setTriggeredJob(job);
  };

  return { activeJobId, activeJobProgress, trackJob };
};
