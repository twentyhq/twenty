/* @license Enterprise */

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { computePlanAllowanceMicro } from 'src/engine/core-modules/billing/utils/compute-plan-allowance-micro.util';

const NOW_MS = new Date('2026-11-15T00:00:00.000Z').getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

const monthlySubscription = {
  interval: SubscriptionInterval.Month,
  status: SubscriptionStatus.Active,
};

describe('computePlanAllowanceMicro', () => {
  it('keeps the plan allowance when no workspace credit allowance is active', () => {
    expect(
      computePlanAllowanceMicro({
        ...monthlySubscription,
        planAllowanceMicro: 30_000_000,
        workspaceCreditsForPackMicro: 10_000_000,
        workspaceCreditAllowances: [],
        nowMs: NOW_MS,
      }),
    ).toBe(30_000_000);
  });

  it('replaces the included credits and keeps the credit pack', () => {
    expect(
      computePlanAllowanceMicro({
        ...monthlySubscription,
        planAllowanceMicro: 30_000_000,
        workspaceCreditsForPackMicro: 10_000_000,
        workspaceCreditAllowances: [
          {
            creditAllowanceMicro: 0,
            startsAtMs: NOW_MS - DAY_MS,
            endsAtMs: null,
          },
        ],
        nowMs: NOW_MS,
      }),
    ).toBe(10_000_000);
  });

  it('gives an allowance to a plan without one', () => {
    expect(
      computePlanAllowanceMicro({
        ...monthlySubscription,
        planAllowanceMicro: null,
        workspaceCreditsForPackMicro: 0,
        workspaceCreditAllowances: [
          {
            creditAllowanceMicro: 5_000_000,
            startsAtMs: NOW_MS - DAY_MS,
            endsAtMs: NOW_MS + DAY_MS,
          },
        ],
        nowMs: NOW_MS,
      }),
    ).toBe(5_000_000);
  });

  it('keeps the plan allowance of a subscription cached before workspace credit allowances existed', () => {
    expect(
      computePlanAllowanceMicro({
        ...monthlySubscription,
        planAllowanceMicro: 30_000_000,
        workspaceCreditsForPackMicro: 10_000_000,
        nowMs: NOW_MS,
      }),
    ).toBe(30_000_000);
  });

  it.each([
    ['not started yet', NOW_MS + DAY_MS, null],
    ['already ended', NOW_MS - 2 * DAY_MS, NOW_MS],
  ])('ignores an allowance %s', (_, startsAtMs, endsAtMs) => {
    expect(
      computePlanAllowanceMicro({
        ...monthlySubscription,
        planAllowanceMicro: 30_000_000,
        workspaceCreditsForPackMicro: 10_000_000,
        workspaceCreditAllowances: [
          { creditAllowanceMicro: 0, startsAtMs, endsAtMs },
        ],
        nowMs: NOW_MS,
      }),
    ).toBe(30_000_000);
  });
});
