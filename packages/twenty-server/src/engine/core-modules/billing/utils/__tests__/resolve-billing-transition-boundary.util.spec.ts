/* @license Enterprise */

import { resolveBillingTransitionBoundary } from 'src/engine/core-modules/billing/utils/resolve-billing-transition-boundary.util';

const JANUARY = new Date('2026-01-01T00:00:00.000Z');
const FEBRUARY = new Date('2026-02-01T00:00:00.000Z');
const MARCH = new Date('2026-03-01T00:00:00.000Z');

describe('resolveBillingTransitionBoundary', () => {
  it('takes the period end while the subscription still holds the closing period', () => {
    const boundary = resolveBillingTransitionBoundary({
      invoiceCreatedAt: FEBRUARY,
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
    });

    expect(boundary).toEqual(FEBRUARY);
  });

  it('takes the period start once the subscription has advanced', () => {
    const boundary = resolveBillingTransitionBoundary({
      invoiceCreatedAt: FEBRUARY,
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
      invoiceCreatedAt: new Date('2026-02-01T00:04:00.000Z'),
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
    });

    expect(boundary).toEqual(FEBRUARY);
  });

  // invoice.created is stamped when Stripe raised the invoice, not when we got
  // to it, so a redelivery days later resolves exactly as the first attempt did.
  // Reading our own clock here used to drag the observation point with the
  // delay and pick the period end still in the future.
  it('resolves a redelivery days later to the same handover', () => {
    const boundary = resolveBillingTransitionBoundary({
      invoiceCreatedAt: FEBRUARY,
      subscriptionCurrentPeriodStart: FEBRUARY,
      subscriptionCurrentPeriodEnd: MARCH,
    });

    expect(boundary).toEqual(FEBRUARY);
  });

  // Settling March here would run on partial usage and reserve the idempotency
  // key the real March transition then needs. The invoice was raised at the
  // February handover, so that is the boundary it announces however far into
  // the period we happen to process it.
  it('never settles a period that has not ended yet', () => {
    const boundary = resolveBillingTransitionBoundary({
      invoiceCreatedAt: FEBRUARY,
      subscriptionCurrentPeriodStart: FEBRUARY,
      subscriptionCurrentPeriodEnd: MARCH,
    });

    expect(boundary).toEqual(FEBRUARY);
  });

  it('takes the period end for a redelivery long after it closed', () => {
    const boundary = resolveBillingTransitionBoundary({
      invoiceCreatedAt: new Date('2026-02-20T00:00:00.000Z'),
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
    });

    expect(boundary).toEqual(FEBRUARY);
  });

  // Stripe can raise the invoice a moment before it rolls the subscription's
  // period end. Rejecting the boundary outright here would hand back the period
  // start, and on a first cycle there is no spent idempotency key to make that
  // a no-op: the transition would reconstruct a pre-subscription window and
  // write carry-forward rows into the period still open.
  it('still reads a boundary the invoice was raised a moment before', () => {
    const boundary = resolveBillingTransitionBoundary({
      invoiceCreatedAt: new Date('2026-01-31T23:59:59.000Z'),
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
    });

    expect(boundary).toEqual(FEBRUARY);
  });

  // The handover is a whole period away from the other candidate, so nothing
  // realistic reaches the midpoint. An invoice raised nearer the period start
  // than its end is announcing that start, not a period end still to come.
  it('does not reach forward to a period end the invoice predates by most of a period', () => {
    const boundary = resolveBillingTransitionBoundary({
      invoiceCreatedAt: new Date('2026-01-05T00:00:00.000Z'),
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
    });

    expect(boundary).toEqual(JANUARY);
  });
});
