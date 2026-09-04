import { renderHook } from '@testing-library/react';

import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { QUEUE_JOB_BROWSER_EVENT_NAME } from '@/queue-job/constants/QueueJobBrowserEventName';
import { useListenToQueueJobState } from '@/queue-job/hooks/useListenToQueueJobState';
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

describe('useListenToQueueJobState', () => {
  it('only forwards state changes of the listened job', () => {
    const onStateChange = jest.fn();

    renderHook(() =>
      useListenToQueueJobState({ jobId: JOB_ID, onStateChange }),
    );

    dispatchQueueJobEvent('job-2', JobState.COMPLETED);
    dispatchQueueJobEvent(JOB_ID, JobState.FAILED);

    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ jobId: JOB_ID, state: JobState.FAILED }),
    );
  });

  it('ignores events without a job id', () => {
    const onStateChange = jest.fn();

    renderHook(() => useListenToQueueJobState({ onStateChange }));

    dispatchQueueJobEvent(JOB_ID, JobState.COMPLETED);

    expect(onStateChange).not.toHaveBeenCalled();
  });
});
