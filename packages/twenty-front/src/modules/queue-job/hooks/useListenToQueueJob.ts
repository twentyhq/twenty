import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { QUEUE_JOB_BROWSER_EVENT_NAME } from '@/queue-job/constants/QueueJobBrowserEventName';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type JobStatus } from '~/generated-metadata/graphql';

type UseListenToQueueJobArgs = {
  jobId?: string;
  onQueueJobEvent: (jobStatus: JobStatus) => void;
};

export const useListenToQueueJob = ({
  jobId,
  onQueueJobEvent,
}: UseListenToQueueJobArgs) => {
  const handleQueueJobEvent = useCallback(
    (jobStatus?: JobStatus) => {
      if (
        !isDefined(jobId) ||
        !isDefined(jobStatus) ||
        jobStatus.jobId !== jobId
      ) {
        return;
      }

      onQueueJobEvent(jobStatus);
    },
    [jobId, onQueueJobEvent],
  );

  useListenToBrowserEvent<JobStatus>({
    eventName: QUEUE_JOB_BROWSER_EVENT_NAME,
    onBrowserEvent: handleQueueJobEvent,
  });
};
