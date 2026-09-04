import { QUEUE_JOB_BROWSER_EVENT_NAME } from '@/queue-job/constants/QueueJobBrowserEventName';
import { useEffect } from 'react';
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
  useEffect(() => {
    if (!isDefined(jobId)) {
      return;
    }

    const handleQueueJobEvent = (event: CustomEvent<JobStatus>) => {
      if (event.detail.jobId !== jobId) {
        return;
      }

      onStateChange(event.detail);
    };

    window.addEventListener(
      QUEUE_JOB_BROWSER_EVENT_NAME,
      handleQueueJobEvent as EventListener,
    );

    return () => {
      window.removeEventListener(
        QUEUE_JOB_BROWSER_EVENT_NAME,
        handleQueueJobEvent as EventListener,
      );
    };
  }, [jobId, onStateChange]);
};
