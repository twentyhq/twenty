import { act, renderHook } from '@testing-library/react';

import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { QUEUE_JOB_BROWSER_EVENT_NAME } from '@/queue-job/constants/QueueJobBrowserEventName';
import { useTrackedQueueJob } from '@/queue-job/hooks/useTrackedQueueJob';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { JobState, type JobStatus } from '~/generated-metadata/graphql';

type TrackedQueueJobProps = {
  runningJob?: { jobId: string; context: string };
};

const FIRST_JOB_ID = 'install-application.workspace-id.application-first';
const SECOND_JOB_ID = 'install-application.workspace-id.application-second';
const CONTEXT = 'application-universal-identifier';

const buildJobStatus = (
  jobId: string,
  state: JobState,
  progress?: number,
): JobStatus => ({
  jobId,
  state,
  attemptsMade: 1,
  enqueuedAt: 1,
  ...(progress === undefined ? {} : { progress }),
});

const dispatchJobStatus = (
  jobId: string,
  state: JobState,
  progress?: number,
) => {
  act(() => {
    dispatchBrowserEvent<JobStatus>(
      QUEUE_JOB_BROWSER_EVENT_NAME,
      buildJobStatus(jobId, state, progress),
    );
  });
};

const dispatchEventStreamReconnected = async () => {
  await act(async () => {
    dispatchBrowserEvent(SSE_CLIENT_RECONNECTED_EVENT_NAME);
  });
};

describe('useTrackedQueueJob', () => {
  it('settles a tracked job on its terminal browser event with its context', () => {
    const onQueueJobSettled = jest.fn();

    const { result } = renderHook(() =>
      useTrackedQueueJob<string>({ onQueueJobSettled }),
    );

    act(() => {
      result.current.trackJob({ jobId: FIRST_JOB_ID, context: CONTEXT });
    });

    expect(result.current.activeJobId).toBe(FIRST_JOB_ID);

    dispatchJobStatus(FIRST_JOB_ID, JobState.ACTIVE);

    expect(result.current.activeJobId).toBe(FIRST_JOB_ID);
    expect(onQueueJobSettled).not.toHaveBeenCalled();

    dispatchJobStatus(FIRST_JOB_ID, JobState.COMPLETED);

    expect(result.current.activeJobId).toBeUndefined();
    expect(onQueueJobSettled).toHaveBeenCalledWith(
      buildJobStatus(FIRST_JOB_ID, JobState.COMPLETED),
      CONTEXT,
    );
  });

  it('tracks a job the server reports as running', () => {
    const onQueueJobSettled = jest.fn();

    const { result } = renderHook(() =>
      useTrackedQueueJob<string>({
        runningJob: { jobId: FIRST_JOB_ID, context: CONTEXT },
        onQueueJobSettled,
      }),
    );

    expect(result.current.activeJobId).toBe(FIRST_JOB_ID);

    dispatchJobStatus(FIRST_JOB_ID, JobState.FAILED);

    expect(result.current.activeJobId).toBeUndefined();
    expect(onQueueJobSettled).toHaveBeenCalledWith(
      buildJobStatus(FIRST_JOB_ID, JobState.FAILED),
      CONTEXT,
    );
  });

  it('ignores terminal events of other jobs', () => {
    const onQueueJobSettled = jest.fn();

    const { result } = renderHook(() =>
      useTrackedQueueJob<string>({ onQueueJobSettled }),
    );

    act(() => {
      result.current.trackJob({ jobId: FIRST_JOB_ID, context: CONTEXT });
    });
    dispatchJobStatus(SECOND_JOB_ID, JobState.COMPLETED);

    expect(result.current.activeJobId).toBe(FIRST_JOB_ID);
    expect(onQueueJobSettled).not.toHaveBeenCalled();
  });

  it('does not fall back to a settled running job after a retried job settles', () => {
    const onQueueJobSettled = jest.fn();

    const { result } = renderHook(() =>
      useTrackedQueueJob<string>({
        runningJob: { jobId: FIRST_JOB_ID, context: CONTEXT },
        onQueueJobSettled,
      }),
    );

    dispatchJobStatus(FIRST_JOB_ID, JobState.FAILED);

    expect(result.current.activeJobId).toBeUndefined();

    act(() => {
      result.current.trackJob({ jobId: SECOND_JOB_ID, context: CONTEXT });
    });

    expect(result.current.activeJobId).toBe(SECOND_JOB_ID);

    dispatchJobStatus(SECOND_JOB_ID, JobState.COMPLETED);

    expect(result.current.activeJobId).toBeUndefined();
    expect(onQueueJobSettled).toHaveBeenCalledTimes(2);
  });

  it('exposes the latest progress of the active job', () => {
    const onQueueJobSettled = jest.fn();

    const { result } = renderHook(() =>
      useTrackedQueueJob<string>({ onQueueJobSettled }),
    );

    act(() => {
      result.current.trackJob({ jobId: FIRST_JOB_ID, context: CONTEXT });
    });

    expect(result.current.activeJobProgress).toBeUndefined();

    dispatchJobStatus(FIRST_JOB_ID, JobState.ACTIVE, 25);

    expect(result.current.activeJobProgress).toBe(25);

    dispatchJobStatus(FIRST_JOB_ID, JobState.ACTIVE);

    expect(result.current.activeJobProgress).toBe(25);

    dispatchJobStatus(FIRST_JOB_ID, JobState.ACTIVE, 75);

    expect(result.current.activeJobProgress).toBe(75);

    dispatchJobStatus(FIRST_JOB_ID, JobState.COMPLETED, 100);

    expect(result.current.activeJobId).toBeUndefined();
    expect(result.current.activeJobProgress).toBeUndefined();
  });

  it('starts from the progress the server reports for a running job', () => {
    const onQueueJobSettled = jest.fn();

    const { result } = renderHook(() =>
      useTrackedQueueJob<string>({
        runningJob: { jobId: FIRST_JOB_ID, context: CONTEXT, progress: 40 },
        onQueueJobSettled,
      }),
    );

    expect(result.current.activeJobProgress).toBe(40);

    dispatchJobStatus(FIRST_JOB_ID, JobState.ACTIVE, 60);

    expect(result.current.activeJobProgress).toBe(60);
  });

  it('ignores progress events of other jobs', () => {
    const onQueueJobSettled = jest.fn();

    const { result } = renderHook(() =>
      useTrackedQueueJob<string>({ onQueueJobSettled }),
    );

    act(() => {
      result.current.trackJob({ jobId: FIRST_JOB_ID, context: CONTEXT });
    });
    dispatchJobStatus(SECOND_JOB_ID, JobState.ACTIVE, 50);

    expect(result.current.activeJobProgress).toBeUndefined();
  });

  it('settles with the context the job was tracked with', () => {
    const onQueueJobSettled = jest.fn();

    const { result, rerender } = renderHook(
      ({ runningJob }: TrackedQueueJobProps) =>
        useTrackedQueueJob<string>({ runningJob, onQueueJobSettled }),
      { initialProps: {} as TrackedQueueJobProps },
    );

    act(() => {
      result.current.trackJob({ jobId: FIRST_JOB_ID, context: CONTEXT });
    });

    rerender({
      runningJob: { jobId: SECOND_JOB_ID, context: 'other-application' },
    });

    dispatchJobStatus(FIRST_JOB_ID, JobState.COMPLETED);

    expect(onQueueJobSettled).toHaveBeenCalledWith(
      buildJobStatus(FIRST_JOB_ID, JobState.COMPLETED),
      CONTEXT,
    );
  });

  it('settles a job that ended while the event stream was down', async () => {
    const onQueueJobSettled = jest.fn();
    const fetchJobStatus = jest
      .fn()
      .mockResolvedValue(buildJobStatus(FIRST_JOB_ID, JobState.COMPLETED));

    const { result } = renderHook(() =>
      useTrackedQueueJob<string>({ onQueueJobSettled, fetchJobStatus }),
    );

    act(() => {
      result.current.trackJob({ jobId: FIRST_JOB_ID, context: CONTEXT });
    });

    await dispatchEventStreamReconnected();

    expect(fetchJobStatus).toHaveBeenCalledWith(FIRST_JOB_ID, CONTEXT);
    expect(result.current.activeJobId).toBeUndefined();
    expect(onQueueJobSettled).toHaveBeenCalledWith(
      buildJobStatus(FIRST_JOB_ID, JobState.COMPLETED),
      CONTEXT,
    );
  });

  it('keeps tracking a job still running after the event stream reconnects', async () => {
    const onQueueJobSettled = jest.fn();
    const fetchJobStatus = jest
      .fn()
      .mockResolvedValue(buildJobStatus(FIRST_JOB_ID, JobState.ACTIVE, 50));

    const { result } = renderHook(() =>
      useTrackedQueueJob<string>({
        runningJob: { jobId: FIRST_JOB_ID, context: CONTEXT },
        onQueueJobSettled,
        fetchJobStatus,
      }),
    );

    await dispatchEventStreamReconnected();

    expect(result.current.activeJobId).toBe(FIRST_JOB_ID);
    expect(result.current.activeJobProgress).toBe(50);
    expect(onQueueJobSettled).not.toHaveBeenCalled();
  });

  it('does not settle a job again when its status arrives after it settled', async () => {
    const onQueueJobSettled = jest.fn();
    let resolveJobStatus: (jobStatus: JobStatus) => void = () => {};
    const fetchJobStatus = jest.fn(
      () =>
        new Promise<JobStatus>((resolve) => {
          resolveJobStatus = resolve;
        }),
    );

    const { result } = renderHook(() =>
      useTrackedQueueJob<string>({ onQueueJobSettled, fetchJobStatus }),
    );

    act(() => {
      result.current.trackJob({ jobId: FIRST_JOB_ID, context: CONTEXT });
    });

    await dispatchEventStreamReconnected();

    dispatchJobStatus(FIRST_JOB_ID, JobState.COMPLETED);

    await act(async () => {
      resolveJobStatus(buildJobStatus(FIRST_JOB_ID, JobState.COMPLETED));
    });

    expect(onQueueJobSettled).toHaveBeenCalledTimes(1);
  });

  it('does not fetch any status on reconnection without an active job', async () => {
    const fetchJobStatus = jest.fn();

    renderHook(() =>
      useTrackedQueueJob<string>({
        onQueueJobSettled: jest.fn(),
        fetchJobStatus,
      }),
    );

    await dispatchEventStreamReconnected();

    expect(fetchJobStatus).not.toHaveBeenCalled();
  });

  it('stops tracking a job the server no longer knows after the event stream reconnects', async () => {
    const onQueueJobSettled = jest.fn();
    const fetchJobStatus = jest.fn().mockResolvedValue(null);

    const { result } = renderHook(() =>
      useTrackedQueueJob<string>({ onQueueJobSettled, fetchJobStatus }),
    );

    act(() => {
      result.current.trackJob({ jobId: FIRST_JOB_ID, context: CONTEXT });
    });

    await dispatchEventStreamReconnected();

    expect(result.current.activeJobId).toBeUndefined();
    expect(onQueueJobSettled).not.toHaveBeenCalled();
  });

  it('keeps tracking a job when its status cannot be fetched after the event stream reconnects', async () => {
    const fetchJobStatus = jest.fn().mockRejectedValue(new Error('Network'));

    const { result } = renderHook(() =>
      useTrackedQueueJob<string>({
        onQueueJobSettled: jest.fn(),
        fetchJobStatus,
      }),
    );

    act(() => {
      result.current.trackJob({ jobId: FIRST_JOB_ID, context: CONTEXT });
    });

    await dispatchEventStreamReconnected();

    expect(result.current.activeJobId).toBe(FIRST_JOB_ID);
  });
});
