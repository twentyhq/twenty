import { computeJobQueueWaitMs } from 'src/engine/core-modules/message-queue/utils/compute-job-queue-wait-ms.util';

const NOW = 1_700_000_000_000;

describe('computeJobQueueWaitMs', () => {
  it('measures the time since creation for a job enqueued without delay', () => {
    expect(
      computeJobQueueWaitMs({
        job: { timestamp: NOW - 1_500, opts: {}, attemptsStarted: 1 },
        now: NOW,
      }),
    ).toBe(1_500);
  });

  it('subtracts the scheduled delay so an on-time delayed job reads as no wait', () => {
    expect(
      computeJobQueueWaitMs({
        job: {
          timestamp: NOW - 60_000,
          opts: { delay: 60_000 },
          attemptsStarted: 1,
        },
        now: NOW,
      }),
    ).toBe(0);
  });

  it('keeps only the wait beyond the scheduled delay', () => {
    expect(
      computeJobQueueWaitMs({
        job: {
          timestamp: NOW - 62_000,
          opts: { delay: 60_000 },
          attemptsStarted: 1,
        },
        now: NOW,
      }),
    ).toBe(2_000);
  });

  it('never goes negative when the worker runs ahead of the clock', () => {
    expect(
      computeJobQueueWaitMs({
        job: { timestamp: NOW + 10, opts: {}, attemptsStarted: 1 },
        now: NOW,
      }),
    ).toBe(0);
  });

  it('does not measure a re-run, whose creation timestamp predates its previous start', () => {
    expect(
      computeJobQueueWaitMs({
        job: { timestamp: NOW - 120_000, opts: {}, attemptsStarted: 2 },
        now: NOW,
      }),
    ).toBeUndefined();
  });
});
