import { act, renderHook } from '@testing-library/react';

import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { QUEUE_JOB_BROWSER_EVENT_NAME } from '@/queue-job/constants/QueueJobBrowserEventName';
import { QUEUE_JOB_STATUS_POLL_INTERVAL_MS } from '@/queue-job/constants/QueueJobStatusPollIntervalMs';
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
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('settles a tracked job on its terminal browser event', () => {
    const onQueueJobSettled = jest.fn();
    const fetchJobStatus = jest.fn();

    const { result } = renderHook(() =>
      useTrackedQueueJob({ fetchJobStatus, onQueueJobSettled }),
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

  it('settles a running job from polling when no browser event arrives', async () => {
    const onQueueJobSettled = jest.fn();
    const fetchJobStatus = jest
      .fn()
      .mockResolvedValueOnce(buildJobStatus(JobState.ACTIVE))
      .mockResolvedValueOnce(buildJobStatus(JobState.FAILED));

    const { result } = renderHook(() =>
      useTrackedQueueJob({
        runningJobId: JOB_ID,
        fetchJobStatus,
        onQueueJobSettled,
      }),
    );

    expect(result.current.activeJobId).toBe(JOB_ID);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(QUEUE_JOB_STATUS_POLL_INTERVAL_MS);
    });

    expect(fetchJobStatus).toHaveBeenCalledWith(JOB_ID);
    expect(result.current.activeJobId).toBe(JOB_ID);
    expect(onQueueJobSettled).not.toHaveBeenCalled();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(QUEUE_JOB_STATUS_POLL_INTERVAL_MS);
    });

    expect(result.current.activeJobId).toBeUndefined();
    expect(onQueueJobSettled).toHaveBeenCalledWith(
      buildJobStatus(JobState.FAILED),
    );

    await act(async () => {
      await jest.advanceTimersByTimeAsync(QUEUE_JOB_STATUS_POLL_INTERVAL_MS);
    });

    expect(fetchJobStatus).toHaveBeenCalledTimes(2);
  });

  it('tracks a newly triggered job after a previous one settled', () => {
    const onQueueJobSettled = jest.fn();

    const { result } = renderHook(() =>
      useTrackedQueueJob({ fetchJobStatus: jest.fn(), onQueueJobSettled }),
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
