import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FIREFLIES_BACKFILL_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/fireflies-backfill-batch-logic-function-universal-identifier.constant';
import { FIREFLIES_BACKFILL_BATCH_RETRY_LIMIT } from 'src/logic-functions/constants/fireflies-backfill-batch-retry-limit.constant';
import { FIREFLIES_BACKFILL_BATCH_STAGGER_MILLISECONDS } from 'src/logic-functions/constants/fireflies-backfill-batch-stagger-milliseconds.constant';
import { enqueueFirefliesBackfillBatches } from 'src/logic-functions/data/enqueue-fireflies-backfill-batches.util';

const enqueueJobMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJob: enqueueJobMock,
}));

describe('enqueueFirefliesBackfillBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enqueueJobMock.mockResolvedValue({
      enqueued: true,
      logicFunctionUniversalIdentifier:
        FIREFLIES_BACKFILL_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    });
  });

  it('enqueues one staggered job per batch', async () => {
    const enqueuedBatchCount = await enqueueFirefliesBackfillBatches({
      transcriptIdBatches: [['call-1', 'call-2'], ['call-3'], ['call-4']],
    });

    expect(enqueuedBatchCount).toBe(3);
    expect(enqueueJobMock).toHaveBeenNthCalledWith(1, {
      logicFunctionUniversalIdentifier:
        FIREFLIES_BACKFILL_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: { transcriptIds: ['call-1', 'call-2'] },
      retryLimit: FIREFLIES_BACKFILL_BATCH_RETRY_LIMIT,
      delayMs: 0,
    });
    expect(enqueueJobMock).toHaveBeenNthCalledWith(2, {
      logicFunctionUniversalIdentifier:
        FIREFLIES_BACKFILL_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: { transcriptIds: ['call-3'] },
      retryLimit: FIREFLIES_BACKFILL_BATCH_RETRY_LIMIT,
      delayMs: FIREFLIES_BACKFILL_BATCH_STAGGER_MILLISECONDS,
    });
    expect(enqueueJobMock).toHaveBeenNthCalledWith(3, {
      logicFunctionUniversalIdentifier:
        FIREFLIES_BACKFILL_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: { transcriptIds: ['call-4'] },
      retryLimit: FIREFLIES_BACKFILL_BATCH_RETRY_LIMIT,
      delayMs: 2 * FIREFLIES_BACKFILL_BATCH_STAGGER_MILLISECONDS,
    });
  });

  it('counts only the batches that enqueued', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    enqueueJobMock
      .mockResolvedValueOnce({
        enqueued: true,
        logicFunctionUniversalIdentifier:
          FIREFLIES_BACKFILL_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      })
      .mockRejectedValueOnce(new Error('Network failed'));

    const enqueuedBatchCount = await enqueueFirefliesBackfillBatches({
      transcriptIdBatches: [['call-1'], ['call-2']],
    });

    expect(enqueuedBatchCount).toBe(1);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
