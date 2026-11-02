/* @license Enterprise */

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { computeWorkspaceCreditAllowanceForPeriodMicro } from 'src/engine/core-modules/billing/utils/compute-workspace-credit-allowance-for-period-micro.util';

describe('computeWorkspaceCreditAllowanceForPeriodMicro', () => {
  it('gives one month of credits on a monthly subscription', () => {
    expect(
      computeWorkspaceCreditAllowanceForPeriodMicro({
        creditAllowanceMicro: 5_000_000,
        interval: SubscriptionInterval.Month,
        isTrialing: false,
      }),
    ).toBe(5_000_000);
  });

  it('gives twelve months of credits on a yearly subscription', () => {
    expect(
      computeWorkspaceCreditAllowanceForPeriodMicro({
        creditAllowanceMicro: 5_000_000,
        interval: SubscriptionInterval.Year,
        isTrialing: false,
      }),
    ).toBe(60_000_000);
  });

  it('gives one month of credits during a trial, whatever the interval', () => {
    expect(
      computeWorkspaceCreditAllowanceForPeriodMicro({
        creditAllowanceMicro: 5_000_000,
        interval: SubscriptionInterval.Year,
        isTrialing: true,
      }),
    ).toBe(5_000_000);
  });
});
