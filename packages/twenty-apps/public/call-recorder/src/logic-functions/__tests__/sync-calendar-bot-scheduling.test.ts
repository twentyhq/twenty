import { beforeEach, describe, expect, it, vi } from 'vitest';

import { APPLY_CALENDAR_BOT_SCHEDULING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { syncCalendarBotSchedulingHandler } from 'src/logic-functions/sync-calendar-bot-scheduling';

const enqueueJobsMock = vi.hoisted(() => vi.fn());
const metadataClientOptionsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/metadata', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-client-sdk/metadata')>()),
  MetadataApiClient: class {
    constructor(options: unknown) {
      metadataClientOptionsMock(options);
    }

    async mutation(mutation: { enqueueJobs: { __args: { input: unknown } } }) {
      return {
        enqueueJobs: await enqueueJobsMock(mutation.enqueueJobs.__args.input),
      };
    }
  },
}));

describe('syncCalendarBotSchedulingHandler', () => {
  beforeEach(() => {
    enqueueJobsMock.mockReset();
    metadataClientOptionsMock.mockReset();
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

  it('enqueues as the application so the apply chain sees the whole workspace', async () => {
    await syncCalendarBotSchedulingHandler();

    expect(metadataClientOptionsMock).toHaveBeenCalledWith(
      expect.objectContaining({ runAs: 'application' }),
    );
  });

  it('throws when the apply job cannot be enqueued', async () => {
    enqueueJobsMock.mockRejectedValue(new Error('queue unavailable'));

    await expect(syncCalendarBotSchedulingHandler()).rejects.toThrow(
      'queue unavailable',
    );
  });
});
