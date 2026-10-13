/* @license Enterprise */

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { computeMemberCreditsSlice } from 'src/engine/core-modules/billing/utils/compute-member-credits-slice.util';

const computeYearlySlice = ({
  currentPeriodStart,
  currentPeriodEnd,
  now,
}: {
  currentPeriodStart: string;
  currentPeriodEnd: string;
  now: string;
}) =>
  computeMemberCreditsSlice({
    currentPeriodStart: new Date(currentPeriodStart),
    currentPeriodEnd: new Date(currentPeriodEnd),
    interval: SubscriptionInterval.Year,
    status: SubscriptionStatus.Active,
    now: new Date(now),
  });

const toSlice = (periodStart: string, periodEnd: string) => ({
  periodStart: new Date(periodStart),
  periodEnd: new Date(periodEnd),
});

describe('computeMemberCreditsSlice', () => {
  it('uses the whole period on a monthly plan', () => {
    expect(
      computeMemberCreditsSlice({
        currentPeriodStart: new Date('2026-03-10T08:00:00.000Z'),
        currentPeriodEnd: new Date('2026-04-10T08:00:00.000Z'),
        interval: SubscriptionInterval.Month,
        status: SubscriptionStatus.Active,
        now: new Date('2026-03-25T00:00:00.000Z'),
      }),
    ).toEqual(toSlice('2026-03-10T08:00:00.000Z', '2026-04-10T08:00:00.000Z'));
  });

  it('uses the whole trial on a yearly price', () => {
    expect(
      computeMemberCreditsSlice({
        currentPeriodStart: new Date('2026-03-10T08:00:00.000Z'),
        currentPeriodEnd: new Date('2026-04-10T08:00:00.000Z'),
        interval: SubscriptionInterval.Year,
        status: SubscriptionStatus.Trialing,
        now: new Date('2026-03-25T00:00:00.000Z'),
      }),
    ).toEqual(toSlice('2026-03-10T08:00:00.000Z', '2026-04-10T08:00:00.000Z'));
  });

  it('slices a yearly period on its anchor day', () => {
    expect(
      computeYearlySlice({
        currentPeriodStart: '2026-01-15T00:00:00.000Z',
        currentPeriodEnd: '2027-01-15T00:00:00.000Z',
        now: '2026-06-20T00:00:00.000Z',
      }),
    ).toEqual(toSlice('2026-06-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'));
  });

  it('opens the next slice exactly on its boundary', () => {
    expect(
      computeYearlySlice({
        currentPeriodStart: '2026-01-15T10:30:00.000Z',
        currentPeriodEnd: '2027-01-15T10:30:00.000Z',
        now: '2026-02-15T10:30:00.000Z',
      }),
    ).toEqual(toSlice('2026-02-15T10:30:00.000Z', '2026-03-15T10:30:00.000Z'));
  });

  // Stripe bills a 31st anchor on the last day of shorter months, then on the 31st again
  it('follows a 31st anchor back to the 31st after a short month', () => {
    expect(
      computeYearlySlice({
        currentPeriodStart: '2026-01-31T10:00:00.000Z',
        currentPeriodEnd: '2027-01-31T10:00:00.000Z',
        now: '2026-03-10T00:00:00.000Z',
      }),
    ).toEqual(toSlice('2026-02-28T10:00:00.000Z', '2026-03-31T10:00:00.000Z'));
  });

  it('reads a Feb 29 anchor as the 28th between leap years', () => {
    expect(
      computeYearlySlice({
        currentPeriodStart: '2025-02-28T00:00:00.000Z',
        currentPeriodEnd: '2026-02-28T00:00:00.000Z',
        now: '2025-03-29T00:00:00.000Z',
      }),
    ).toEqual(toSlice('2025-03-28T00:00:00.000Z', '2025-04-28T00:00:00.000Z'));
  });

  it('recovers the 29th anchor from a period start Stripe clamped to Feb 28', () => {
    expect(
      computeYearlySlice({
        currentPeriodStart: '2027-02-28T00:00:00.000Z',
        currentPeriodEnd: '2028-02-29T00:00:00.000Z',
        now: '2027-03-28T00:00:00.000Z',
      }),
    ).toEqual(toSlice('2027-02-28T00:00:00.000Z', '2027-03-29T00:00:00.000Z'));
  });

  it('keeps the start day when the end day differs for another reason', () => {
    expect(
      computeYearlySlice({
        currentPeriodStart: '2026-01-03T00:00:00.000Z',
        currentPeriodEnd: '2027-01-20T00:00:00.000Z',
        now: '2026-01-25T00:00:00.000Z',
      }),
    ).toEqual(toSlice('2026-01-03T00:00:00.000Z', '2026-02-03T00:00:00.000Z'));
  });

  it('ends the last slice of a short yearly period at the period end', () => {
    expect(
      computeYearlySlice({
        currentPeriodStart: '2026-01-10T00:00:00.000Z',
        currentPeriodEnd: '2026-07-25T00:00:00.000Z',
        now: '2026-07-20T00:00:00.000Z',
      }),
    ).toEqual(toSlice('2026-07-10T00:00:00.000Z', '2026-07-25T00:00:00.000Z'));
  });

  it('opens a 13th slice in a yearly period longer than a year', () => {
    expect(
      computeYearlySlice({
        currentPeriodStart: '2026-01-10T00:00:00.000Z',
        currentPeriodEnd: '2027-02-10T00:00:00.000Z',
        now: '2027-01-20T00:00:00.000Z',
      }),
    ).toEqual(toSlice('2027-01-10T00:00:00.000Z', '2027-02-10T00:00:00.000Z'));
  });

  it.each([
    ['before the period starts', '2026-01-09T23:59:59.999Z'],
    ['when the period has ended', '2027-01-10T00:00:00.000Z'],
  ])('opens no slice %s', (_label, now) => {
    expect(
      computeYearlySlice({
        currentPeriodStart: '2026-01-10T00:00:00.000Z',
        currentPeriodEnd: '2027-01-10T00:00:00.000Z',
        now,
      }),
    ).toBeNull();
  });
});
