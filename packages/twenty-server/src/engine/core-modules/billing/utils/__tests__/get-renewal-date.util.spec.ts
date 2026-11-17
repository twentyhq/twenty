/* @license Enterprise */

import { getRenewalDate } from 'src/engine/core-modules/billing/utils/get-renewal-date.util';

const JANUARY = new Date('2026-01-01T00:00:00.000Z');
const FEBRUARY = new Date('2026-02-01T00:00:00.000Z');
const MARCH = new Date('2026-03-01T00:00:00.000Z');

describe('getRenewalDate', () => {
  it('takes the period end while the subscription still holds the closing period', () => {
    const renewalDate = getRenewalDate({
      invoiceCreatedAt: FEBRUARY,
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
    });

    expect(renewalDate).toEqual(FEBRUARY);
  });

  it('takes the period start once the subscription has advanced', () => {
    const renewalDate = getRenewalDate({
      invoiceCreatedAt: FEBRUARY,
      subscriptionCurrentPeriodStart: FEBRUARY,
      subscriptionCurrentPeriodEnd: MARCH,
    });

    expect(renewalDate).toEqual(FEBRUARY);
  });

  // Stripe stamps metered invoices with the period that just closed; the subscription pins the renewal date
  it('does not move to the start of the period that just closed', () => {
    const renewalDate = getRenewalDate({
      invoiceCreatedAt: new Date('2026-02-01T00:04:00.000Z'),
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
    });

    expect(renewalDate).toEqual(FEBRUARY);
  });

  // invoice.created is Stripe's stamp, so a redelivery days later returns the same date as the first attempt
  it('returns the same renewal date for a redelivery days later', () => {
    const renewalDate = getRenewalDate({
      invoiceCreatedAt: FEBRUARY,
      subscriptionCurrentPeriodStart: FEBRUARY,
      subscriptionCurrentPeriodEnd: MARCH,
    });

    expect(renewalDate).toEqual(FEBRUARY);
  });

  // Settling March would run on partial usage and burn the real March transition's idempotency key
  it('never settles a period that has not ended yet', () => {
    const renewalDate = getRenewalDate({
      invoiceCreatedAt: FEBRUARY,
      subscriptionCurrentPeriodStart: FEBRUARY,
      subscriptionCurrentPeriodEnd: MARCH,
    });

    expect(renewalDate).toEqual(FEBRUARY);
  });

  it('takes the period end for a redelivery long after it closed', () => {
    const renewalDate = getRenewalDate({
      invoiceCreatedAt: new Date('2026-02-20T00:00:00.000Z'),
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
    });

    expect(renewalDate).toEqual(FEBRUARY);
  });

  // Stripe can raise the invoice just before rolling the period end; rejecting it writes carry-forward into the open period
  it('takes the period end when the invoice was raised a moment before it', () => {
    const renewalDate = getRenewalDate({
      invoiceCreatedAt: new Date('2026-01-31T23:59:59.000Z'),
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
    });

    expect(renewalDate).toEqual(FEBRUARY);
  });

  // An invoice raised nearer the period start than its end announces that start
  it('does not reach forward to a period end the invoice predates by most of a period', () => {
    const renewalDate = getRenewalDate({
      invoiceCreatedAt: new Date('2026-01-05T00:00:00.000Z'),
      subscriptionCurrentPeriodStart: JANUARY,
      subscriptionCurrentPeriodEnd: FEBRUARY,
    });

    expect(renewalDate).toEqual(JANUARY);
  });
});
