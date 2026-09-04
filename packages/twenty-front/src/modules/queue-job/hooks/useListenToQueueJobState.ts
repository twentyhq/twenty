import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { QUEUE_JOB_BROWSER_EVENT_NAME } from '@/queue-job/constants/QueueJobBrowserEventName';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type JobStatus } from '~/generated-metadata/graphql';

type UseListenToQueueJobStateArgs = {
  jobId?: string;
  onStateChange: (jobStatus: JobStatus) => void;
};

export const useListenToQueueJobState = ({
  jobId,
  onStateChange,
}: UseListenToQueueJobStateArgs) => {
  const onQueueJobEvent = useCallback(
    (jobStatus?: JobStatus) => {
      if (!isDefined(jobStatus) || jobStatus.jobId !== jobId) {
        return;
      }

      onStateChange(jobStatus);
    },
    [jobId, onStateChange],
  );

  useListenToBrowserEvent<JobStatus>({
    eventName: QUEUE_JOB_BROWSER_EVENT_NAME,
    onBrowserEvent: onQueueJobEvent,
  });
};
