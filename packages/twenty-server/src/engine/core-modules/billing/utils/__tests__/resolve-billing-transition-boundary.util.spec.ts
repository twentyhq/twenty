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

  // Stripe stamps metered invoices with the period that just closed; the subscription pins the handover
  it('does not move to the start of the period that just closed', () => {
    const boundary = resolveBillingTransitionBoundary({
      invoiceCreatedAt: new Date('2026-02-01T00:04:00.000Z'),
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
    });

    expect(boundary).toEqual(FEBRUARY);
  });

  // invoice.created is Stripe's stamp, so a redelivery days later resolves like the first attempt
  it('resolves a redelivery days later to the same handover', () => {
    const boundary = resolveBillingTransitionBoundary({
      invoiceCreatedAt: FEBRUARY,
      subscriptionCurrentPeriodStart: FEBRUARY,
      subscriptionCurrentPeriodEnd: MARCH,
    });

    expect(boundary).toEqual(FEBRUARY);
  });

  // Settling March would run on partial usage and burn the real March transition's idempotency key
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

  // Stripe can raise the invoice just before rolling the period end; rejecting it writes carry-forward into the open period
  it('still reads a boundary the invoice was raised a moment before', () => {
    const boundary = resolveBillingTransitionBoundary({
      invoiceCreatedAt: new Date('2026-01-31T23:59:59.000Z'),
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
    });

    expect(boundary).toEqual(FEBRUARY);
  });

  // An invoice raised nearer the period start than its end announces that start
  it('does not reach forward to a period end the invoice predates by most of a period', () => {
    const boundary = resolveBillingTransitionBoundary({
      invoiceCreatedAt: new Date('2026-01-05T00:00:00.000Z'),
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
    });

    expect(boundary).toEqual(JANUARY);
  });
});
