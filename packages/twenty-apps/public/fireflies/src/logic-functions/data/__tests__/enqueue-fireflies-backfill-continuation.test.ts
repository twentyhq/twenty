import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FIREFLIES_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/fireflies-backfill-logic-function-universal-identifier.constant';
import { FIREFLIES_BACKFILL_CONTINUATION_RETRY_LIMIT } from 'src/logic-functions/constants/fireflies-backfill-continuation-retry-limit.constant';
import { enqueueFirefliesBackfillContinuation } from 'src/logic-functions/data/enqueue-fireflies-backfill-continuation.util';

const enqueueJobMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJob: enqueueJobMock,
}));

const CONTINUATION_CURSOR = {
  fromDate: '2026-05-01T00:00:00.000Z',
  toDate: '2026-07-30T00:00:00.000Z',
  skip: 50,
};

describe('enqueueFirefliesBackfillContinuation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enqueueJobMock.mockResolvedValue({
      enqueued: true,
      logicFunctionUniversalIdentifier:
        FIREFLIES_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    });
  });

  it('enqueues the continuation and reports success', async () => {
    const result = await enqueueFirefliesBackfillContinuation({
      cursor: CONTINUATION_CURSOR,
    });

    expect(result).toBe(true);
    expect(enqueueJobMock).toHaveBeenCalledWith({
      logicFunctionUniversalIdentifier:
        FIREFLIES_BACKFILL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: { cursor: CONTINUATION_CURSOR },
      retryLimit: FIREFLIES_BACKFILL_CONTINUATION_RETRY_LIMIT,
    });
  });

  it('passes a delay through to the enqueued job', async () => {
    await enqueueFirefliesBackfillContinuation({
      cursor: CONTINUATION_CURSOR,
      delayMs: 60_000,
    });

    expect(enqueueJobMock).toHaveBeenCalledWith(
      expect.objectContaining({ delayMs: 60_000 }),
    );
  });

  it('reports a continuation that failed to enqueue', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    enqueueJobMock.mockRejectedValue(new Error('Network failed'));

    await expect(
      enqueueFirefliesBackfillContinuation({ cursor: CONTINUATION_CURSOR }),
    ).resolves.toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
