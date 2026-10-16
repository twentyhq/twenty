import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { computePlanAllowanceMicro } from 'src/engine/core-modules/billing/utils/compute-plan-allowance-micro.util';

const DAY = 24 * 60 * 60 * 1000;
const periodStart = new Date('2026-04-01T00:00:00Z');
const atDay = (day: number) => new Date(periodStart.getTime() + day * DAY);
const change = (day: number, previousSeats: number, seats: number) => ({
  changedAt: atDay(day),
  previousSeats,
  seats,
});
const defaults = {
  workspaceCreditsPerSeat: 4_000_000,
  seats: 5,
  interval: SubscriptionInterval.Month,
  periodStart,
  periodEnd: atDay(30),
  seatChanges: [],
  packCreditsMicro: 50_000_000,
};

describe('computePlanAllowanceMicro', () => {
  it.each([
    ['pack only', { workspaceCreditsPerSeat: undefined }, 50_000_000, 0],
    ['no changes', {}, 70_000_000, 20_000_000],
    [
      'increase',
      { seats: 8, seatChanges: [change(10, 5, 8)] },
      78_000_000,
      28_000_000,
    ],
    [
      'decrease',
      { seats: 3, seatChanges: [change(15, 5, 3)] },
      66_000_000,
      16_000_000,
    ],
    [
      'rounds once after all changes',
      {
        seats: 6,
        seatChanges: [change(10, 5, 8), change(20, 8, 6)],
        packCreditsMicro: 100_000_000,
      },
      125_333_333,
      25_333_333,
    ],
    [
      'same-time add and remove',
      { seatChanges: [change(10, 5, 8), change(10, 8, 5)] },
      70_000_000,
      20_000_000,
    ],
    [
      'period start',
      { seats: 8, seatChanges: [change(0, 5, 8)] },
      82_000_000,
      32_000_000,
    ],
    [
      'yearly',
      { interval: SubscriptionInterval.Year },
      290_000_000,
      240_000_000,
    ],
    [
      'after period end',
      { seats: 10, seatChanges: [change(10, 5, 8), change(31, 8, 10)] },
      78_000_000,
      28_000_000,
    ],
    [
      'exactly at period end',
      { seats: 8, seatChanges: [change(30, 5, 8)] },
      70_000_000,
      20_000_000,
    ],
    [
      'before period start',
      { seatChanges: [change(-1, 3, 5)] },
      70_000_000,
      20_000_000,
    ],
    ['free pack', { packCreditsMicro: 0 }, 20_000_000, 20_000_000],
    [
      'no credits',
      { packCreditsMicro: 0, workspaceCreditsPerSeat: 0 },
      null,
      0,
    ],
    [
      'opening allowance excludes later changes',
      { atPeriodStart: true, seats: 8, seatChanges: [change(10, 5, 8)] },
      70_000_000,
      20_000_000,
    ],
    [
      'opening allowance includes boundary changes',
      { atPeriodStart: true, seats: 8, seatChanges: [change(0, 5, 8)] },
      82_000_000,
      32_000_000,
    ],
  ])(
    '%s',
    (_name, overrides, planAllowanceMicro, workspaceCreditsGrantedForSeats) => {
      expect(computePlanAllowanceMicro({ ...defaults, ...overrides })).toEqual({
        planAllowanceMicro,
        workspaceCreditsGrantedForSeats,
      });
    },
  );

  it('does not depend on delivery order', () => {
    const seatChanges = [change(10, 5, 8), change(20, 8, 6)];

    expect(
      computePlanAllowanceMicro({ ...defaults, seats: 6, seatChanges }),
    ).toEqual(
      computePlanAllowanceMicro({
        ...defaults,
        seats: 6,
        seatChanges: [...seatChanges].reverse(),
      }),
    );
  });
});
