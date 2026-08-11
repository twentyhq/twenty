/* @license Enterprise */

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { deriveBillingPeriodTransition } from 'src/engine/core-modules/billing/utils/derive-billing-period-transition.util';

const JANUARY = new Date('2026-01-01T00:00:00.000Z');
const FEBRUARY = new Date('2026-02-01T00:00:00.000Z');
const MARCH = new Date('2026-03-01T00:00:00.000Z');

describe('deriveBillingPeriodTransition', () => {
  it('treats the invoiced period start as the boundary between the two periods', () => {
    const result = deriveBillingPeriodTransition({
      invoicePeriodStart: FEBRUARY,
      invoicePeriodEnd: MARCH,
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
      subscriptionInterval: SubscriptionInterval.Month,
      trialStart: null,
      isFirstPeriodAfterTrial: false,
    });

    expect(result).toEqual({
      closingPeriodStart: JANUARY,
      closingPeriodEnd: FEBRUARY,
      nextPeriodStart: FEBRUARY,
      nextPeriodEnd: MARCH,
    });
  });

  it('closes the trial period when the trial just ended', () => {
    const trialStart = new Date('2026-01-20T00:00:00.000Z');

    const result = deriveBillingPeriodTransition({
      invoicePeriodStart: FEBRUARY,
      invoicePeriodEnd: MARCH,
      subscriptionCurrentPeriodStart: FEBRUARY,
      subscriptionCurrentPeriodEnd: MARCH,
      subscriptionInterval: SubscriptionInterval.Month,
      trialStart,
      isFirstPeriodAfterTrial: true,
    });

    expect(result).toEqual({
      closingPeriodStart: trialStart,
      closingPeriodEnd: FEBRUARY,
      nextPeriodStart: FEBRUARY,
      nextPeriodEnd: MARCH,
    });
  });

  // The invoiced period is 28 days here while the closing one is 31, so
  // subtracting the invoiced duration would land on January 4 and drop three
  // days of usage.
  it('falls back one calendar month when the subscription already advanced', () => {
    const result = deriveBillingPeriodTransition({
      invoicePeriodStart: FEBRUARY,
      invoicePeriodEnd: MARCH,
      subscriptionCurrentPeriodStart: FEBRUARY,
      subscriptionCurrentPeriodEnd: MARCH,
      subscriptionInterval: SubscriptionInterval.Month,
      trialStart: null,
      isFirstPeriodAfterTrial: false,
    });

    expect(result.closingPeriodStart).toEqual(JANUARY);
    expect(result.closingPeriodEnd).toEqual(FEBRUARY);
  });

  it('falls back one calendar year for a yearly subscription', () => {
    const result = deriveBillingPeriodTransition({
      invoicePeriodStart: JANUARY,
      invoicePeriodEnd: new Date('2027-01-01T00:00:00.000Z'),
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: new Date('2027-01-01T00:00:00.000Z'),
      subscriptionInterval: SubscriptionInterval.Year,
      trialStart: null,
      isFirstPeriodAfterTrial: false,
    });

    expect(result.closingPeriodStart).toEqual(
      new Date('2025-01-01T00:00:00.000Z'),
    );
  });

  it('keeps the closing period aligned across a leap February', () => {
    const result = deriveBillingPeriodTransition({
      invoicePeriodStart: new Date('2024-03-01T00:00:00.000Z'),
      invoicePeriodEnd: new Date('2024-04-01T00:00:00.000Z'),
      subscriptionCurrentPeriodStart: new Date('2024-03-01T00:00:00.000Z'),
      subscriptionCurrentPeriodEnd: new Date('2024-04-01T00:00:00.000Z'),
      subscriptionInterval: SubscriptionInterval.Month,
      trialStart: null,
      isFirstPeriodAfterTrial: false,
    });

    expect(result.closingPeriodStart).toEqual(
      new Date('2024-02-01T00:00:00.000Z'),
    );
  });

  it('falls back to the trial period start only when the trial actually ran', () => {
    const result = deriveBillingPeriodTransition({
      invoicePeriodStart: FEBRUARY,
      invoicePeriodEnd: MARCH,
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
      subscriptionInterval: SubscriptionInterval.Month,
      trialStart: null,
      isFirstPeriodAfterTrial: true,
    });

    expect(result.closingPeriodStart).toEqual(JANUARY);
  });

  // A subscription anchored on the 31st runs January 31 to February 28, and
  // subMonths clamps February 28 back to January 28. Three days of the previous
  // period would count as usage here, and grants that expired on January 31
  // would read as live and be carried forward a second time.
  it('prefers the period start the ledger recorded over clamped calendar arithmetic', () => {
    const monthEndBoundary = new Date('2026-02-28T00:00:00.000Z');
    const ledgerPeriodStart = new Date('2026-01-31T00:00:00.000Z');

    const result = deriveBillingPeriodTransition({
      invoicePeriodStart: monthEndBoundary,
      invoicePeriodEnd: new Date('2026-03-31T00:00:00.000Z'),
      subscriptionCurrentPeriodStart: monthEndBoundary,
      subscriptionCurrentPeriodEnd: new Date('2026-03-31T00:00:00.000Z'),
      subscriptionInterval: SubscriptionInterval.Month,
      trialStart: null,
      isFirstPeriodAfterTrial: false,
      ledgerPeriodStart,
    });

    expect(result.closingPeriodStart).toEqual(ledgerPeriodStart);
  });

  it('ignores a ledger period start that is not before the boundary', () => {
    const result = deriveBillingPeriodTransition({
      invoicePeriodStart: FEBRUARY,
      invoicePeriodEnd: MARCH,
      subscriptionCurrentPeriodStart: FEBRUARY,
      subscriptionCurrentPeriodEnd: MARCH,
      subscriptionInterval: SubscriptionInterval.Month,
      trialStart: null,
      isFirstPeriodAfterTrial: false,
      ledgerPeriodStart: MARCH,
    });

    expect(result.closingPeriodStart).toEqual(JANUARY);
  });

  it('falls back to calendar arithmetic when the ledger has nothing to say', () => {
    const result = deriveBillingPeriodTransition({
      invoicePeriodStart: FEBRUARY,
      invoicePeriodEnd: MARCH,
      subscriptionCurrentPeriodStart: FEBRUARY,
      subscriptionCurrentPeriodEnd: MARCH,
      subscriptionInterval: SubscriptionInterval.Month,
      trialStart: null,
      isFirstPeriodAfterTrial: false,
      ledgerPeriodStart: null,
    });

    expect(result.closingPeriodStart).toEqual(JANUARY);
  });

  // The subscription still carries the closing period, so it is authoritative
  // and the ledger must not override it.
  it('keeps the subscription period start when it precedes the boundary', () => {
    const result = deriveBillingPeriodTransition({
      invoicePeriodStart: FEBRUARY,
      invoicePeriodEnd: MARCH,
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
      subscriptionInterval: SubscriptionInterval.Month,
      trialStart: null,
      isFirstPeriodAfterTrial: false,
      ledgerPeriodStart: new Date('2026-01-15T00:00:00.000Z'),
    });

    expect(result.closingPeriodStart).toEqual(JANUARY);
  });

  it('uses the subscription period end when the invoice carries no forward period', () => {
    const result = deriveBillingPeriodTransition({
      invoicePeriodStart: FEBRUARY,
      invoicePeriodEnd: FEBRUARY,
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: MARCH,
      subscriptionInterval: SubscriptionInterval.Month,
      trialStart: null,
      isFirstPeriodAfterTrial: false,
    });

    expect(result.nextPeriodStart).toEqual(FEBRUARY);
    expect(result.nextPeriodEnd).toEqual(MARCH);
  });
});
