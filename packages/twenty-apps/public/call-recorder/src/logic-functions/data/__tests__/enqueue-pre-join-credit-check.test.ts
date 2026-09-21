import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { enqueuePreJoinCreditCheck } from 'src/logic-functions/data/enqueue-pre-join-credit-check.util';

const enqueueJobsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  enqueueJobs: enqueueJobsMock,
}));

describe('enqueuePreJoinCreditCheck', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));
    enqueueJobsMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays the job until ten minutes before the join', async () => {
    await enqueuePreJoinCreditCheck({
      callRecordingId: 'call-recording-1',
      externalBotId: 'recall-bot-1',
      joinAt: '2026-01-01T13:00:00.000Z',
    });

    expect(enqueueJobsMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        jobs: [
          {
            jobId: `credit-check.call-recording-1.recall-bot-1.${new Date('2026-01-01T13:00:00.000Z').getTime()}`,
            payload: { callRecordingId: 'call-recording-1' },
          },
        ],
        delayMs: 50 * 60_000,
      }),
    );
  });

  it('runs the job at once when the check time has already passed', async () => {
    await enqueuePreJoinCreditCheck({
      callRecordingId: 'call-recording-1',
      externalBotId: 'recall-bot-1',
      joinAt: '2026-01-01T12:09:59.000Z',
    });

    expect(enqueueJobsMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ delayMs: 0 }),
    );
  });
});
