import { waitForCreditTopUpGrant } from '@/settings/billing/utils/waitForCreditTopUpGrant';

type FetchStep = number | undefined | Error;

const runWait = async (steps: FetchStep[], maxAttempts = 3) => {
  let fetchCount = 0;
  let waitCount = 0;

  const isGranted = await waitForCreditTopUpGrant({
    fetchTotalGrantedCredits: async () => {
      const step = steps[Math.min(fetchCount, steps.length - 1)];

      fetchCount++;

      if (step instanceof Error) {
        throw step;
      }

      return step;
    },
    initialTotalGrantedCredits: 100,
    waitBeforeAttempt: async () => {
      waitCount++;
    },
    maxAttempts,
  });

  return { isGranted, fetchCount, waitCount };
};

describe('waitForCreditTopUpGrant', () => {
  it('should stop as soon as the balance grows', async () => {
    const { isGranted, fetchCount, waitCount } = await runWait([100, 110], 5);

    expect(isGranted).toBe(true);
    expect(fetchCount).toBe(2);
    expect(waitCount).toBe(2);
  });

  it('should wait before the first attempt so the webhook gets a chance to land', async () => {
    const { waitCount } = await runWait([110]);

    expect(waitCount).toBe(1);
  });

  it('should skip a failed or empty fetch and keep polling', async () => {
    const { isGranted } = await runWait([
      new Error('Network error'),
      undefined,
      110,
    ]);

    expect(isGranted).toBe(true);
  });

  it('should give up after the last attempt when the balance never grows', async () => {
    const { isGranted, fetchCount } = await runWait([100], 4);

    expect(isGranted).toBe(false);
    expect(fetchCount).toBe(4);
  });

  it('should not count a lower balance as a grant', async () => {
    const { isGranted } = await runWait([90], 2);

    expect(isGranted).toBe(false);
  });
});
