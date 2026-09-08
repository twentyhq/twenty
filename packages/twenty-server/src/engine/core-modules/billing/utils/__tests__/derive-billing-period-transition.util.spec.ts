/* @license Enterprise */

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import {
  deriveBillingPeriodTransition,
  resolveBillingTransitionBoundary,
} from 'src/engine/core-modules/billing/utils/derive-billing-period-transition.util';

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

  // The whole point of resolving the boundary from the subscription is that the
  // invoice's stamped period is unreliable. Classifying the trial off that same
  // stamped period_start put an arrears-stamped first paid period on the paid
  // tier allowance instead of the trial one.
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

  // The subscription still carries the closing period, so it is exact and
  // nothing has to be reconstructed from a calendar or from the ledger.
  it('keeps the subscription period start when it precedes the boundary', () => {
    const result = deriveFrom({
      ledgerPeriodStart: new Date('2026-01-15T00:00:00.000Z'),
      subscriptionPreviousPeriodStart: new Date('2025-12-01T00:00:00.000Z'),
    });

    expect(result.closingPeriodStart).toEqual(JANUARY);
  });

  // The subscription records the boundary when it advances, so it is exact for
  // any anchor. The ledger only knows it when the previous transition happened
  // to close a grant there.
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

  // A subscription anchored on the 31st runs January 31 to February 28, and
  // subMonths clamps February 28 back to January 28. Three days of the previous
  // period would count as usage here, and grants that expired on January 31
  // would read as live and be carried forward a second time.
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
});
