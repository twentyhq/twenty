import { beforeEach, describe, expect, it, vi } from 'vitest';

import { APPLY_CALENDAR_BOT_SCHEDULING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { syncCalendarBotSchedulingHandler } from 'src/logic-functions/sync-calendar-bot-scheduling';

const enqueueJobsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  enqueueJobs: enqueueJobsMock,
}));

describe('syncCalendarBotSchedulingHandler', () => {
  beforeEach(() => {
    enqueueJobsMock.mockReset();
    enqueueJobsMock.mockResolvedValue({ enqueued: true });
  });

  it('enqueues the apply job', async () => {
    await expect(syncCalendarBotSchedulingHandler()).resolves.toEqual({
      outcome: 'apply-enqueued',
    });
    expect(enqueueJobsMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        logicFunctionUniversalIdentifier:
          APPLY_CALENDAR_BOT_SCHEDULING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        jobs: [
          {
            jobId: expect.any(String),
            payload: { applyJobId: expect.any(String) },
          },
        ],
        delayMs: expect.any(Number),
      }),
    );
  });

  it('throws when the apply job cannot be enqueued', async () => {
    enqueueJobsMock.mockRejectedValue(new Error('queue unavailable'));

    await expect(syncCalendarBotSchedulingHandler()).rejects.toThrow(
      'queue unavailable',
    );
  });
});
