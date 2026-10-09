import { act, renderHook } from '@testing-library/react';

import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { QUEUE_JOB_BROWSER_EVENT_NAME } from '@/queue-job/constants/QueueJobBrowserEventName';
import { useTrackedQueueJob } from '@/queue-job/hooks/useTrackedQueueJob';
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
});
