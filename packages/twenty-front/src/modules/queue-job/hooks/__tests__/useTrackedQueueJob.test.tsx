import { act, renderHook } from '@testing-library/react';

import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { QUEUE_JOB_BROWSER_EVENT_NAME } from '@/queue-job/constants/QueueJobBrowserEventName';
import { useTrackedQueueJob } from '@/queue-job/hooks/useTrackedQueueJob';
import { JobState, type JobStatus } from '~/generated-metadata/graphql';

const JOB_ID = 'install-application.workspace-id.application';

const buildJobStatus = (state: JobState): JobStatus => ({
  jobId: JOB_ID,
  state,
  attemptsMade: 1,
  enqueuedAt: 1,
});

describe('useTrackedQueueJob', () => {
  it('settles a tracked job on its terminal browser event', () => {
    const onQueueJobSettled = jest.fn();

    const { result } = renderHook(() =>
      useTrackedQueueJob({ onQueueJobSettled }),
    );

    act(() => {
      result.current.trackJob(JOB_ID);
    });

    expect(result.current.activeJobId).toBe(JOB_ID);

    act(() => {
      dispatchBrowserEvent<JobStatus>(
        QUEUE_JOB_BROWSER_EVENT_NAME,
        buildJobStatus(JobState.ACTIVE),
      );
    });

    expect(result.current.activeJobId).toBe(JOB_ID);
    expect(onQueueJobSettled).not.toHaveBeenCalled();

    act(() => {
      dispatchBrowserEvent<JobStatus>(
        QUEUE_JOB_BROWSER_EVENT_NAME,
        buildJobStatus(JobState.COMPLETED),
      );
    });

    expect(result.current.activeJobId).toBeUndefined();
    expect(onQueueJobSettled).toHaveBeenCalledWith(
      buildJobStatus(JobState.COMPLETED),
    );
  });

  it('tracks a job the server reports as running', () => {
    const onQueueJobSettled = jest.fn();

    const { result } = renderHook(() =>
      useTrackedQueueJob({ runningJobId: JOB_ID, onQueueJobSettled }),
    );

    expect(result.current.activeJobId).toBe(JOB_ID);

    act(() => {
      dispatchBrowserEvent<JobStatus>(
        QUEUE_JOB_BROWSER_EVENT_NAME,
        buildJobStatus(JobState.FAILED),
      );
    });

    expect(result.current.activeJobId).toBeUndefined();
    expect(onQueueJobSettled).toHaveBeenCalledWith(
      buildJobStatus(JobState.FAILED),
    );
  });

  it('ignores terminal events of other jobs', () => {
    const onQueueJobSettled = jest.fn();

    const { result } = renderHook(() =>
      useTrackedQueueJob({ onQueueJobSettled }),
    );

    act(() => {
      result.current.trackJob(JOB_ID);
    });
    act(() => {
      dispatchBrowserEvent<JobStatus>(QUEUE_JOB_BROWSER_EVENT_NAME, {
        ...buildJobStatus(JobState.COMPLETED),
        jobId: 'install-application.workspace-id.other-application',
      });
    });

    expect(result.current.activeJobId).toBe(JOB_ID);
    expect(onQueueJobSettled).not.toHaveBeenCalled();
  });

  it('tracks a newly triggered job after a previous one settled', () => {
    const onQueueJobSettled = jest.fn();

    const { result } = renderHook(() =>
      useTrackedQueueJob({ onQueueJobSettled }),
    );

    act(() => {
      result.current.trackJob(JOB_ID);
    });
    act(() => {
      dispatchBrowserEvent<JobStatus>(
        QUEUE_JOB_BROWSER_EVENT_NAME,
        buildJobStatus(JobState.COMPLETED),
      );
    });

    expect(result.current.activeJobId).toBeUndefined();

    act(() => {
      result.current.trackJob(JOB_ID);
    });

    expect(result.current.activeJobId).toBe(JOB_ID);
  });
});
