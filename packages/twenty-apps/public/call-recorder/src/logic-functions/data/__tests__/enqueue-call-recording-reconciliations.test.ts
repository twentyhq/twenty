import { beforeEach, describe, expect, it, vi } from 'vitest';

import { STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL } from 'src/logic-functions/constants/max-payloads-per-enqueue-jobs-call';
import { enqueueCallRecordingReconciliations } from 'src/logic-functions/data/enqueue-call-recording-reconciliations.util';

const enqueueJobsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJobs: enqueueJobsMock,
}));

describe('enqueueCallRecordingReconciliations', () => {
  beforeEach(() => {
    enqueueJobsMock.mockReset().mockResolvedValue({ enqueued: true });
  });

  it('enqueues nothing without recordings', async () => {
    await enqueueCallRecordingReconciliations({
      callRecordingIds: [],
      recoveryDate: '2026-06-10',
    });

    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('gives each recording one job id per recovery day', async () => {
    await enqueueCallRecordingReconciliations({
      callRecordingIds: ['recording-1', 'recording-2'],
      recoveryDate: '2026-06-10',
      delayMs: 60_000,
    });

    expect(enqueueJobsMock).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier:
        STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      jobs: [
        {
          jobId: 'call-recorder-recording-1-reconcile-2026-06-10',
          payload: { callRecordingId: 'recording-1' },
        },
        {
          jobId: 'call-recorder-recording-2-reconcile-2026-06-10',
          payload: { callRecordingId: 'recording-2' },
        },
      ],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs: 60_000,
    });
  });

  it('splits recordings above the mutation cap into multiple calls', async () => {
    await enqueueCallRecordingReconciliations({
      callRecordingIds: Array.from(
        { length: MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL + 1 },
        (_, index) => `recording-${index}`,
      ),
      recoveryDate: '2026-06-10',
    });

    expect(enqueueJobsMock.mock.calls.map(([{ jobs }]) => jobs.length)).toEqual(
      [MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL, 1],
    );
  });
});
