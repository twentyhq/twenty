import { QUEUE_JOB_STATUS_POLL_INTERVAL_MS } from '@/queue-job/constants/QueueJobStatusPollIntervalMs';
import { useListenToQueueJob } from '@/queue-job/hooks/useListenToQueueJob';
import { type TrackedJobStatus } from '@/queue-job/types/TrackedJobStatus';
import { isTerminalJobState } from '@/queue-job/utils/isTerminalJobState';
import { atom, useAtomValue, useStore } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseTrackedQueueJobArgs = {
  // A job the server reports as already in flight, so a page reload picks the
  // tracking back up instead of looking idle
  runningJobId?: string;
  fetchJobStatus: (
    jobId: string,
  ) => Promise<TrackedJobStatus | null | undefined>;
  onQueueJobSettled: (jobStatus: TrackedJobStatus) => void | Promise<void>;
};

export const useTrackedQueueJob = ({
  runningJobId,
  fetchJobStatus,
  onQueueJobSettled,
}: UseTrackedQueueJobArgs) => {
  const [triggeredJobId, setTriggeredJobId] = useState<string>();
  // A browser event and a poll response can settle the same job in one tick,
  // before a re-render, so the settled id is read and written synchronously
  const [settledJobIdAtom] = useState(() =>
    atom<string | undefined>(undefined),
  );
  const store = useStore();
  const settledJobId = useAtomValue(settledJobIdAtom);

  const trackedJobId = triggeredJobId ?? runningJobId;
  const activeJobId =
    isDefined(trackedJobId) && trackedJobId !== settledJobId
      ? trackedJobId
      : undefined;

  const handleQueueJobEvent = useCallback(
    (jobStatus: TrackedJobStatus) => {
      if (
        !isTerminalJobState(jobStatus.state) ||
        store.get(settledJobIdAtom) === jobStatus.jobId
      ) {
        return;
      }

      store.set(settledJobIdAtom, jobStatus.jobId);
      // A settled trigger must stop shadowing a job the server reports later
      setTriggeredJobId((currentTriggeredJobId) =>
        currentTriggeredJobId === jobStatus.jobId
          ? undefined
          : currentTriggeredJobId,
      );
      void onQueueJobSettled(jobStatus);
    },
    [onQueueJobSettled, settledJobIdAtom, store],
  );

  useListenToQueueJob({
    jobId: activeJobId,
    onQueueJobEvent: handleQueueJobEvent,
  });

  // Terminal events only reach the user who queued the job and can be missed
  // between the initial read and the listener registration, so the status is
  // also polled while a job is tracked
  useEffect(() => {
    if (!isDefined(activeJobId)) {
      return;
    }

    let isCancelled = false;

    const interval = setInterval(async () => {
      const jobStatus = await fetchJobStatus(activeJobId).catch(
        () => undefined,
      );

      if (isCancelled || !isDefined(jobStatus)) {
        return;
      }

      if (jobStatus.jobId === activeJobId) {
        handleQueueJobEvent(jobStatus);
      }
    }, QUEUE_JOB_STATUS_POLL_INTERVAL_MS);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [activeJobId, fetchJobStatus, handleQueueJobEvent]);

  const trackJob = (jobId?: string) => {
    store.set(settledJobIdAtom, undefined);
    setTriggeredJobId(jobId);
  };

  return { activeJobId, trackJob };
};
