/* @license Enterprise */

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { deriveBillingPeriodTransition } from 'src/engine/core-modules/billing/utils/derive-billing-period-transition.util';

const JANUARY = new Date('2026-01-01T00:00:00.000Z');
const FEBRUARY = new Date('2026-02-01T00:00:00.000Z');
const MARCH = new Date('2026-03-01T00:00:00.000Z');

const deriveFrom = (
  overrides: Partial<Parameters<typeof deriveBillingPeriodTransition>[0]> = {},
) =>
  deriveBillingPeriodTransition({
    boundary: FEBRUARY,
    subscriptionCurrentPeriodStart: JANUARY,
    subscriptionInterval: SubscriptionInterval.Month,
    trialStart: null,
    trialEnd: null,
    subscriptionPreviousPeriodStart: null,
    ledgerPeriodStart: null,
    ...overrides,
  });

describe('deriveBillingPeriodTransition', () => {
  it('closes the period the boundary ends and opens the next one there', () => {
    expect(deriveFrom()).toEqual({
      closingPeriodStart: JANUARY,
      closingPeriodEnd: FEBRUARY,
      nextPeriodStart: FEBRUARY,
      isFirstPeriodAfterTrial: false,
    });
  });

  it('closes the trial period when the trial just ended', () => {
    const trialStart = new Date('2026-01-20T00:00:00.000Z');

    const result = deriveFrom({
      subscriptionCurrentPeriodStart: FEBRUARY,
      trialStart,
      trialEnd: FEBRUARY,
    });

    expect(result.isFirstPeriodAfterTrial).toBe(true);
    expect(result.closingPeriodStart).toEqual(trialStart);
  });

  it('falls back to the trial period start only when the trial actually ran', () => {
    const result = deriveFrom({ trialEnd: FEBRUARY });

    expect(result.closingPeriodStart).toEqual(JANUARY);
  });

  // The invoice's stamped period is unreliable, so the trial must not be classified off it
  it('reads the trial from the boundary, not from where the closing period began', () => {
    const trialStart = new Date('2026-01-20T00:00:00.000Z');

    const result = deriveFrom({
      subscriptionCurrentPeriodStart: FEBRUARY,
      trialStart,
      trialEnd: new Date('2026-02-01T00:00:30.000Z'),
    });

    expect(result.isFirstPeriodAfterTrial).toBe(true);
  });

  it('does not read an unrelated renewal as the end of a trial', () => {
    const result = deriveFrom({
      trialStart: new Date('2025-12-20T00:00:00.000Z'),
      trialEnd: JANUARY,
    });

    expect(result.isFirstPeriodAfterTrial).toBe(false);
    expect(result.closingPeriodStart).toEqual(JANUARY);
  });

  // The subscription still carries the closing period, so it is exact
  it('keeps the subscription period start when it precedes the boundary', () => {
    const result = deriveFrom({
      ledgerPeriodStart: new Date('2026-01-15T00:00:00.000Z'),
      subscriptionPreviousPeriodStart: new Date('2025-12-01T00:00:00.000Z'),
    });

    expect(result.closingPeriodStart).toEqual(JANUARY);
  });

  // The subscription records the boundary when it advances, so it is exact for any anchor
  it('prefers the period start the subscription recorded over the ledger', () => {
    const monthEndBoundary = new Date('2026-02-28T00:00:00.000Z');

    const result = deriveFrom({
      boundary: monthEndBoundary,
      subscriptionCurrentPeriodStart: monthEndBoundary,
      subscriptionPreviousPeriodStart: new Date('2026-01-31T00:00:00.000Z'),
      ledgerPeriodStart: new Date('2026-01-20T00:00:00.000Z'),
    });

    expect(result.closingPeriodStart).toEqual(
      new Date('2026-01-31T00:00:00.000Z'),
    );
  });

  // subMonths clamps Feb 28 back to Jan 28 for a 31st anchor, miscounting usage and grants
  it('prefers the period start the ledger recorded over clamped calendar arithmetic', () => {
    const monthEndBoundary = new Date('2026-02-28T00:00:00.000Z');
    const ledgerPeriodStart = new Date('2026-01-31T00:00:00.000Z');

    const result = deriveFrom({
      boundary: monthEndBoundary,
      subscriptionCurrentPeriodStart: monthEndBoundary,
      ledgerPeriodStart,
    });

    expect(result.closingPeriodStart).toEqual(ledgerPeriodStart);
  });

  it('ignores a ledger period start that is not before the boundary', () => {
    const result = deriveFrom({
      subscriptionCurrentPeriodStart: FEBRUARY,
      ledgerPeriodStart: MARCH,
    });

    expect(result.closingPeriodStart).toEqual(JANUARY);
  });

  it('falls back one calendar month when the subscription already advanced', () => {
    const result = deriveFrom({ subscriptionCurrentPeriodStart: FEBRUARY });

    expect(result.closingPeriodStart).toEqual(JANUARY);
  });

  it('falls back one calendar year for a yearly subscription', () => {
    const result = deriveFrom({
      boundary: JANUARY,
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionInterval: SubscriptionInterval.Year,
    });

    expect(result.closingPeriodStart).toEqual(
      new Date('2025-01-01T00:00:00.000Z'),
    );
  });

  it('keeps the closing period aligned across a leap February', () => {
    const result = deriveFrom({
      boundary: new Date('2024-03-01T00:00:00.000Z'),
      subscriptionCurrentPeriodStart: new Date('2024-03-01T00:00:00.000Z'),
    });

    expect(result.closingPeriodStart).toEqual(
      new Date('2024-02-01T00:00:00.000Z'),
    );
  });

  // Nullable despite its type: assuming monthly would settle a yearly subscription on one month of usage
  it('refuses to guess a period length when the subscription records no interval', () => {
    expect(() =>
      deriveFrom({
        subscriptionCurrentPeriodStart: FEBRUARY,
        subscriptionInterval: null,
      }),
    ).toThrow(/records no interval/);
  });

  // Only the calendar fallback needs the interval
  it('settles without an interval when the subscription recorded the period start', () => {
    const result = deriveFrom({
      subscriptionCurrentPeriodStart: FEBRUARY,
      subscriptionInterval: null,
      subscriptionPreviousPeriodStart: JANUARY,
    });

    expect(result.closingPeriodStart).toEqual(JANUARY);
  });
});
