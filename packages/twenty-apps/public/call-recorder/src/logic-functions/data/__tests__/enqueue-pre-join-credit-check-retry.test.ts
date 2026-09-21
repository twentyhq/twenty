import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { enqueuePreJoinCreditCheckRetry } from 'src/logic-functions/data/enqueue-pre-join-credit-check-retry.util';

const enqueueJobsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  enqueueJobs: enqueueJobsMock,
}));

const NOW = new Date('2026-01-01T12:50:00.000Z');

describe('enqueuePreJoinCreditCheckRetry', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    enqueueJobsMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('queues a fresh check one minute later under its own job id', async () => {
    await enqueuePreJoinCreditCheckRetry({
      callRecordingId: 'call-recording-1',
      now: NOW,
    });

    expect(enqueueJobsMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        jobs: [
          {
            jobId: `credit-check.call-recording-1.retry.${NOW.getTime()}`,
            payload: { callRecordingId: 'call-recording-1' },
          },
        ],
        delayMs: 60_000,
      }),
    );
  });

  it('fails open when the retry cannot be queued', async () => {
    enqueueJobsMock.mockRejectedValue(new Error('queue unavailable'));

    await expect(
      enqueuePreJoinCreditCheckRetry({
        callRecordingId: 'call-recording-1',
        now: NOW,
      }),
    ).resolves.toBeUndefined();

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('failed to re-enqueue the pre-join credit check'),
    );
  });
});
