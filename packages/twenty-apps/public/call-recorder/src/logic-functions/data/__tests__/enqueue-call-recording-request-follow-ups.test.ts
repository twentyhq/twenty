import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { buildCallRecordingRequestFollowUpJobId } from 'src/logic-functions/domain/build-call-recording-request-follow-up-job-id.util';
import { enqueueCallRecordingRequestFollowUps } from 'src/logic-functions/data/enqueue-call-recording-request-follow-ups.util';
import { RECALL_RECOVERY_CALLS_PER_MINUTE } from 'src/logic-functions/constants/recall-recovery-calls-per-minute';

const enqueueJobsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  enqueueJobs: enqueueJobsMock,
}));

describe('enqueueCallRecordingRequestFollowUps', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:04:30.000Z'));
    enqueueJobsMock.mockReset().mockResolvedValue({ enqueued: true });
  });

  afterEach(() => vi.useRealTimers());

  it('paces every batch and includes each recording exactly once', async () => {
    const callRecordingIds = Array.from(
      { length: 121 },
      (_, index) => `recording-${index}`,
    );
    await enqueueCallRecordingRequestFollowUps({ callRecordingIds });

    const calls = enqueueJobsMock.mock.calls.map(([input]) => input);
    expect(calls.map(({ jobs }) => jobs.length)).toEqual([60, 60, 1]);
    expect(calls.map(({ delayMs }) => delayMs)).toEqual([
      1_800_000, 1_860_000, 1_920_000,
    ]);
    expect(
      calls
        .flatMap(({ jobs }) =>
          jobs.map(
            ({ payload }: { payload: { callRecordingId: string } }) =>
              payload.callRecordingId,
          ),
        )
        .sort(),
    ).toEqual([...callRecordingIds].sort());
  });

  it('uses the same job ID for bulk and individual arms across a pacing window boundary', async () => {
    const callRecordingId = 'z-recording';
    await enqueueCallRecordingRequestFollowUps({
      callRecordingIds: [
        ...Array.from(
          { length: RECALL_RECOVERY_CALLS_PER_MINUTE },
          (_, index) => `a-recording-${index}`,
        ),
        callRecordingId,
      ],
    });
    const bulkCall = enqueueJobsMock.mock.calls[1][0];

    await enqueueCallRecordingRequestFollowUps({
      callRecordingIds: [callRecordingId],
    });
    const individualCall = enqueueJobsMock.mock.calls[2][0];

    expect(bulkCall.jobs).toEqual(individualCall.jobs);
    expect(bulkCall.delayMs).toBe(individualCall.delayMs + 60_000);
    expect(bulkCall.retryLimit).toBe(ENQUEUED_JOB_RETRY_LIMIT);
  });

  it('keys the job to the intended due time, not to when it is enqueued', async () => {
    const dueAt = new Date('2026-01-01T12:09:59.900Z');
    vi.setSystemTime(new Date('2026-01-01T12:05:00.000Z'));

    await enqueueCallRecordingRequestFollowUps({
      callRecordingIds: ['recording-1'],
      dueAt,
      attempt: 1,
    });

    const [{ jobs, delayMs }] = enqueueJobsMock.mock.calls[0];
    expect(jobs[0].jobId).toBe(
      buildCallRecordingRequestFollowUpJobId({
        callRecordingId: 'recording-1',
        attempt: 1,
        dueAt,
      }),
    );
    expect(delayMs).toBe(dueAt.getTime() - Date.now());
  });

  it('enqueues a follow-up whose due time has passed without a delay', async () => {
    await enqueueCallRecordingRequestFollowUps({
      callRecordingIds: ['recording-1'],
      dueAt: new Date('2026-01-01T12:00:00.000Z'),
    });

    expect(enqueueJobsMock.mock.calls[0][0].delayMs).toBe(0);
  });
});
