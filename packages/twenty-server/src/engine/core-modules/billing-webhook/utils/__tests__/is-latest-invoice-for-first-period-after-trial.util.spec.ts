/* @license Enterprise */

import { isLatestInvoiceForFirstPeriodAfterTrial } from 'src/engine/core-modules/billing-webhook/utils/is-latest-invoice-for-first-period-after-trial.util';

const TRIAL_END = 1788392892;
const ONE_DAY_IN_SECONDS = 24 * 60 * 60;

const buildSubscription = ({
  trialEnd,
  linePeriodStart,
}: {
  trialEnd: number | null;
  linePeriodStart: number;
}) => ({
  trial_end: trialEnd,
  latest_invoice: { lines: { data: [{ period: { start: linePeriodStart } }] } },
});

describe('isLatestInvoiceForFirstPeriodAfterTrial', () => {
  it('should be true when the invoice bills the period starting at trial end', () => {
    expect(
      isLatestInvoiceForFirstPeriodAfterTrial(
        buildSubscription({ trialEnd: TRIAL_END, linePeriodStart: TRIAL_END }),
      ),
    ).toBe(true);
  });

  it('should be true when an early trial end starts the period a second later', () => {
    expect(
      isLatestInvoiceForFirstPeriodAfterTrial(
        buildSubscription({
          trialEnd: TRIAL_END,
          linePeriodStart: TRIAL_END + 1,
        }),
      ),
    ).toBe(true);
  });

  it('should be false for a seat increase invoiced during the first paid period', () => {
    expect(
      isLatestInvoiceForFirstPeriodAfterTrial(
        buildSubscription({
          trialEnd: TRIAL_END,
          linePeriodStart: TRIAL_END + 10 * ONE_DAY_IN_SECONDS,
        }),
      ),
    ).toBe(false);
  });

  it('should be false for a renewal invoice', () => {
    expect(
      isLatestInvoiceForFirstPeriodAfterTrial(
        buildSubscription({
          trialEnd: TRIAL_END,
          linePeriodStart: TRIAL_END + 30 * ONE_DAY_IN_SECONDS,
        }),
      ),
    ).toBe(false);
  });

  it('should be false for a subscription that never had a trial', () => {
    expect(
      isLatestInvoiceForFirstPeriodAfterTrial(
        buildSubscription({ trialEnd: null, linePeriodStart: TRIAL_END }),
      ),
    ).toBe(false);
  });
});
