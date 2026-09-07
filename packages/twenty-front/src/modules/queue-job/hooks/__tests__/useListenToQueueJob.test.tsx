import { renderHook } from '@testing-library/react';

import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { QUEUE_JOB_BROWSER_EVENT_NAME } from '@/queue-job/constants/QueueJobBrowserEventName';
import { useListenToQueueJob } from '@/queue-job/hooks/useListenToQueueJob';
import { JobState, type JobStatus } from '~/generated-metadata/graphql';

const JOB_ID = 'job-1';

const dispatchQueueJobEvent = (jobId: string, state: JobState) => {
  dispatchBrowserEvent<JobStatus>(QUEUE_JOB_BROWSER_EVENT_NAME, {
    jobId,
    state,
    attemptsMade: 1,
    enqueuedAt: 1,
  });
};

describe('useListenToQueueJob', () => {
  it('only forwards state changes of the listened job', () => {
    const onQueueJobEvent = jest.fn();

    renderHook(() => useListenToQueueJob({ jobId: JOB_ID, onQueueJobEvent }));

    dispatchQueueJobEvent('job-2', JobState.COMPLETED);
    dispatchQueueJobEvent(JOB_ID, JobState.FAILED);

    expect(onQueueJobEvent).toHaveBeenCalledTimes(1);
    expect(onQueueJobEvent).toHaveBeenCalledWith(
      expect.objectContaining({ jobId: JOB_ID, state: JobState.FAILED }),
    );
  });

  it('ignores events without a job id', () => {
    const onQueueJobEvent = jest.fn();

    renderHook(() => useListenToQueueJob({ onQueueJobEvent }));

    dispatchQueueJobEvent(JOB_ID, JobState.COMPLETED);

    expect(onQueueJobEvent).not.toHaveBeenCalled();
  });
});
