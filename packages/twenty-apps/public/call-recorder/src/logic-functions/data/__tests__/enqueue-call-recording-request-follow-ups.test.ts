import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { enqueueCallRecordingRequestFollowUps } from 'src/logic-functions/data/enqueue-call-recording-request-follow-ups.util';
import { RECALL_RECOVERY_CALLS_PER_MINUTE } from 'src/logic-functions/constants/recall-recovery-calls-per-minute';

const enqueueJobsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({ enqueueJobs: enqueueJobsMock }));

describe('enqueueCallRecordingRequestFollowUps', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:04:30.000Z'));
    enqueueJobsMock.mockReset().mockResolvedValue({ enqueued: true });
  });

  afterEach(() => vi.useRealTimers());

  it('deduplicates bulk and individual arms across a pacing window boundary', async () => {
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
});
