import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL } from 'src/logic-functions/constants/max-payloads-per-enqueue-jobs-call';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';

const enqueueJobsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJobs: enqueueJobsMock,
}));

const TARGET_UNIVERSAL_IDENTIFIER = '5a2f4d2a-1a1e-4c66-8a54-1f0a2b3c4d5e';

describe('enqueueLogicFunctionJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enqueueJobsMock.mockImplementation(async ({ payloads }) => ({
      enqueued: true,
      enqueuedJobsCount: payloads.length,
    }));
  });

  it('enqueues a small payload list in a single call', async () => {
    await enqueueLogicFunctionJobs({
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      payloads: [{ batchIndex: 0 }, { batchIndex: 1 }],
    });

    expect(enqueueJobsMock).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      payloads: [{ batchIndex: 0 }, { batchIndex: 1 }],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
    });
  });

  it('splits payload lists above the mutation cap into multiple calls', async () => {
    const payloads = Array.from(
      { length: MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL + 1 },
      (_, payloadIndex) => ({ payloadIndex }),
    );

    await enqueueLogicFunctionJobs({
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      payloads,
    });

    expect(enqueueJobsMock).toHaveBeenCalledTimes(2);
    expect(enqueueJobsMock.mock.calls[0][0].payloads).toHaveLength(
      MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL,
    );
    expect(enqueueJobsMock.mock.calls[1][0].payloads).toEqual([
      { payloadIndex: MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL },
    ]);
  });

  it('stops at the first failed chunk', async () => {
    const payloads = Array.from(
      { length: MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL * 2 },
      (_, payloadIndex) => ({ payloadIndex }),
    );

    enqueueJobsMock
      .mockResolvedValueOnce({ enqueued: true })
      .mockRejectedValueOnce(new Error('Network failed'));

    await expect(
      enqueueLogicFunctionJobs({
        logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
        payloads,
      }),
    ).rejects.toThrow('Network failed');
    expect(enqueueJobsMock).toHaveBeenCalledTimes(2);
  });
});
