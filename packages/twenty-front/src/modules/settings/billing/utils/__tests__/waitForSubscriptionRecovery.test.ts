import { waitForSubscriptionRecovery } from '@/settings/billing/utils/waitForSubscriptionRecovery';
import { SubscriptionStatus } from '~/generated-metadata/graphql';

type WorkspaceBilling = { status: SubscriptionStatus | undefined };

type FetchStep = SubscriptionStatus | undefined | Error;

const runRecovery = async (steps: FetchStep[], maxAttempts = 3) => {
  let fetchCount = 0;
  let waitCount = 0;

  const result = await waitForSubscriptionRecovery({
    fetchWorkspaceBilling: async (): Promise<WorkspaceBilling> => {
      // The last step repeats so a bounded run can be exercised with one status
      const step = steps[Math.min(fetchCount, steps.length - 1)];

      fetchCount++;

      if (step instanceof Error) {
        throw step;
      }

      return { status: step };
    },
    getSubscriptionStatus: (workspaceBilling) => workspaceBilling.status,
    waitBeforeAttempt: async () => {
      waitCount++;
    },
    maxAttempts,
  });

  return { result, fetchCount, waitCount };
};

describe('waitForSubscriptionRecovery', () => {
  it('should keep polling while the payment is overdue and hand back the recovered billing', async () => {
    const { result, fetchCount, waitCount } = await runRecovery([
      SubscriptionStatus.PastDue,
      SubscriptionStatus.Unpaid,
      SubscriptionStatus.Active,
    ]);

    expect(result).toEqual({
      outcome: 'recovered',
      workspaceBilling: { status: SubscriptionStatus.Active },
    });
    expect(fetchCount).toBe(3);
    expect(waitCount).toBe(3);
  });

  it('should wait before the first attempt so the webhook gets a chance to land', async () => {
    const { waitCount } = await runRecovery([SubscriptionStatus.Active]);

    expect(waitCount).toBe(1);
  });

  it('should skip a failed fetch and keep polling', async () => {
    const { result, fetchCount } = await runRecovery([
      new Error('Network error'),
      SubscriptionStatus.Active,
    ]);

    expect(result.outcome).toBe('recovered');
    expect(fetchCount).toBe(2);
  });

  it('should time out when the payment is still overdue after the last attempt', async () => {
    const { result, fetchCount } = await runRecovery(
      [SubscriptionStatus.PastDue],
      4,
    );

    expect(result).toEqual({ outcome: 'timedOut' });
    expect(fetchCount).toBe(4);
  });

  it('should stop at the first status that can no longer recover', async () => {
    const { result, fetchCount } = await runRecovery([
      SubscriptionStatus.PastDue,
      SubscriptionStatus.Canceled,
      SubscriptionStatus.Active,
    ]);

    expect(result).toEqual({ outcome: 'unrecoverable' });
    expect(fetchCount).toBe(2);
  });

  it('should keep polling while the subscription status is unknown', async () => {
    const { result, fetchCount } = await runRecovery([
      undefined,
      SubscriptionStatus.Active,
    ]);

    expect(result.outcome).toBe('recovered');
    expect(fetchCount).toBe(2);
  });
});
