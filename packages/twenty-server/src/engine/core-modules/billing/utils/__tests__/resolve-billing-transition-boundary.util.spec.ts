/* @license Enterprise */

import { resolveBillingTransitionBoundary } from 'src/engine/core-modules/billing/utils/resolve-billing-transition-boundary.util';

const JANUARY = new Date('2026-01-01T00:00:00.000Z');
const FEBRUARY = new Date('2026-02-01T00:00:00.000Z');
const MARCH = new Date('2026-03-01T00:00:00.000Z');

describe('resolveBillingTransitionBoundary', () => {
  it('takes the period end while the subscription still holds the closing period', () => {
    const boundary = resolveBillingTransitionBoundary({
      observedAt: FEBRUARY,
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
    });

    expect(boundary).toEqual(FEBRUARY);
  });

  it('takes the period start once the subscription has advanced', () => {
    const boundary = resolveBillingTransitionBoundary({
      observedAt: FEBRUARY,
      subscriptionCurrentPeriodStart: FEBRUARY,
      subscriptionCurrentPeriodEnd: MARCH,
    });

    expect(boundary).toEqual(FEBRUARY);
  });

  // Stripe stamps an invoice carrying metered items with the period that just
  // closed, so reading the boundary off invoicePeriodStart used to settle the
  // period before the one that ended and carry its grants into a window that
  // was already over. The subscription pins the handover whatever the stamp.
  it('does not move to the start of the period that just closed', () => {
    const boundary = resolveBillingTransitionBoundary({
      observedAt: new Date('2026-02-01T00:04:00.000Z'),
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
    });

    expect(boundary).toEqual(FEBRUARY);
  });

  it('stays on the handover the webhook is about when redelivered days later', () => {
    const boundary = resolveBillingTransitionBoundary({
      observedAt: new Date('2026-02-03T00:00:00.000Z'),
      subscriptionCurrentPeriodStart: FEBRUARY,
      subscriptionCurrentPeriodEnd: MARCH,
    });

    expect(boundary).toEqual(FEBRUARY);
  });

  // Taking the nearest boundary instead would pick March here, settling a
  // period that has not closed on partial usage and reserving the idempotency
  // key the real March transition then needs.
  it('never settles a period that has not ended yet', () => {
    const boundary = resolveBillingTransitionBoundary({
      observedAt: new Date('2026-02-20T00:00:00.000Z'),
      subscriptionCurrentPeriodStart: FEBRUARY,
      subscriptionCurrentPeriodEnd: MARCH,
    });

    expect(boundary).toEqual(FEBRUARY);
  });

  it('takes the period end for a redelivery long after it closed', () => {
    const boundary = resolveBillingTransitionBoundary({
      observedAt: new Date('2026-02-20T00:00:00.000Z'),
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
    });

    expect(boundary).toEqual(FEBRUARY);
  });

  // Stripe raises the invoice at the handover, so our clock can read a moment
  // short of it.
  it('accepts a boundary that has all but arrived', () => {
    const boundary = resolveBillingTransitionBoundary({
      observedAt: new Date('2026-01-31T23:59:30.000Z'),
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
    });

    expect(boundary).toEqual(FEBRUARY);
  });
});
