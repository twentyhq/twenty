/* @license Enterprise */

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

  it('falls back to one invoiced duration when the subscription already advanced', () => {
    const result = deriveBillingPeriodTransition({
      invoicePeriodStart: FEBRUARY,
      invoicePeriodEnd: MARCH,
      subscriptionCurrentPeriodStart: FEBRUARY,
      subscriptionCurrentPeriodEnd: MARCH,
      trialStart: null,
      isFirstPeriodAfterTrial: false,
    });

    const invoicedDurationMs = MARCH.getTime() - FEBRUARY.getTime();

    expect(result.closingPeriodStart).toEqual(
      new Date(FEBRUARY.getTime() - invoicedDurationMs),
    );
    expect(result.closingPeriodEnd).toEqual(FEBRUARY);
  });

  it('falls back to the trial period start only when the trial actually ran', () => {
    const result = deriveBillingPeriodTransition({
      invoicePeriodStart: FEBRUARY,
      invoicePeriodEnd: MARCH,
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
      trialStart: null,
      isFirstPeriodAfterTrial: true,
    });

    expect(result.closingPeriodStart).toEqual(JANUARY);
  });

  it('uses the subscription period end when the invoice carries no forward period', () => {
    const result = deriveBillingPeriodTransition({
      invoicePeriodStart: FEBRUARY,
      invoicePeriodEnd: FEBRUARY,
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: MARCH,
      trialStart: null,
      isFirstPeriodAfterTrial: false,
    });

    expect(result.nextPeriodStart).toEqual(FEBRUARY);
    expect(result.nextPeriodEnd).toEqual(MARCH);
  });
});
