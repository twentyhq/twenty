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

  it('stays on the handover the webhook is about when redelivered days later', () => {
    const boundary = resolveBillingTransitionBoundary({
      invoiceCreatedAt: new Date('2026-02-03T00:00:00.000Z'),
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
      invoiceCreatedAt: new Date('2026-02-20T00:00:00.000Z'),
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

  // This used to allow an hour for skew against our own clock, which also let a
  // period end an hour in the future through — the one thing the rule exists to
  // prevent. Both instants come from Stripe now, so the comparison is exact.
  //
  // It also fails in the safe direction: taking the period start re-runs a
  // settlement that already happened, whose idempotency keys are spent, so it
  // writes nothing. Taking a period end that has not arrived would settle an
  // open period on partial usage and burn the key the real transition needs.
  it('does not accept a period end that has not arrived yet', () => {
    const boundary = resolveBillingTransitionBoundary({
      invoiceCreatedAt: new Date('2026-01-31T23:30:00.000Z'),
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
    });

    expect(boundary).toEqual(JANUARY);
  });
});
