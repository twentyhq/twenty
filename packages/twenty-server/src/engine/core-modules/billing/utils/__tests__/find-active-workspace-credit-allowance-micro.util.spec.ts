/* @license Enterprise */

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { findActiveWorkspaceCreditAllowanceMicro } from 'src/engine/core-modules/billing/utils/find-active-workspace-credit-allowance-micro.util';

const NOW_MS = new Date('2026-11-15T00:00:00.000Z').getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

const activeAllowance = {
  creditAllowanceMicro: 5_000_000,
  startsAtMs: NOW_MS - DAY_MS,
  endsAtMs: null,
};

describe('findActiveWorkspaceCreditAllowanceMicro', () => {
  it('gives one month of credits on a monthly subscription', () => {
    expect(
      findActiveWorkspaceCreditAllowanceMicro({
        workspaceCreditAllowances: [activeAllowance],
        nowMs: NOW_MS,
        interval: SubscriptionInterval.Month,
        isTrialing: false,
      }),
    ).toBe(5_000_000);
  });

  it('gives twelve months of credits on a yearly subscription', () => {
    expect(
      findActiveWorkspaceCreditAllowanceMicro({
        workspaceCreditAllowances: [activeAllowance],
        nowMs: NOW_MS,
        interval: SubscriptionInterval.Year,
        isTrialing: false,
      }),
    ).toBe(60_000_000);
  });

  it('gives one month of credits during the trial of a yearly subscription', () => {
    expect(
      findActiveWorkspaceCreditAllowanceMicro({
        workspaceCreditAllowances: [activeAllowance],
        nowMs: NOW_MS,
        interval: SubscriptionInterval.Year,
        isTrialing: true,
      }),
    ).toBe(5_000_000);
  });

  it('picks the allowance active at the given time among ended ones', () => {
    expect(
      findActiveWorkspaceCreditAllowanceMicro({
        workspaceCreditAllowances: [
          {
            creditAllowanceMicro: 1_000_000,
            startsAtMs: NOW_MS - 10 * DAY_MS,
            endsAtMs: NOW_MS - DAY_MS,
          },
          activeAllowance,
        ],
        nowMs: NOW_MS,
        interval: SubscriptionInterval.Month,
        isTrialing: false,
      }),
    ).toBe(5_000_000);
  });

  it('finds nothing when no allowance is active', () => {
    expect(
      findActiveWorkspaceCreditAllowanceMicro({
        workspaceCreditAllowances: [
          { ...activeAllowance, startsAtMs: NOW_MS + DAY_MS },
        ],
        nowMs: NOW_MS,
        interval: SubscriptionInterval.Month,
        isTrialing: false,
      }),
    ).toBeNull();
  });
});
