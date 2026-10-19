/* @license Enterprise */

import { type BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { resolveBillingPeriodBoundaryUpdate } from 'src/engine/core-modules/billing/utils/resolve-billing-period-boundary-update.util';

const JANUARY = new Date('2026-01-01T00:00:00.000Z');
const FEBRUARY = new Date('2026-02-01T00:00:00.000Z');
const MARCH = new Date('2026-03-01T00:00:00.000Z');

const buildStoredSubscription = ({
  currentPeriodStart,
  currentPeriodEnd,
  currentPeriodPeakSeats,
  seats,
}: {
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  currentPeriodPeakSeats: number | null;
  seats: number;
}) => ({
  currentPeriodStart,
  currentPeriodEnd,
  currentPeriodPeakSeats,
  billingSubscriptionItems: [
    {
      quantity: seats,
      billingProduct: {
        metadata: { productKey: BillingProductKey.BASE_PRODUCT },
      },
    } as BillingSubscriptionItemEntity,
  ],
});

describe('resolveBillingPeriodBoundaryUpdate', () => {
  it('records the period the subscription just moved off with its peak seats', () => {
    expect(
      resolveBillingPeriodBoundaryUpdate({
        incomingPeriodStart: FEBRUARY,
        storedSubscription: buildStoredSubscription({
          currentPeriodStart: JANUARY,
          currentPeriodEnd: FEBRUARY,
          currentPeriodPeakSeats: 8,
          seats: 6,
        }),
      }),
    ).toEqual({
      previousPeriodStart: JANUARY,
      previousPeriodPeakSeats: 8,
      currentPeriodPeakSeats: null,
    });
  });

  it('keeps the seats held at the end of the period when no peak was recorded', () => {
    expect(
      resolveBillingPeriodBoundaryUpdate({
        incomingPeriodStart: FEBRUARY,
        storedSubscription: buildStoredSubscription({
          currentPeriodStart: JANUARY,
          currentPeriodEnd: FEBRUARY,
          currentPeriodPeakSeats: null,
          seats: 6,
        }),
      }),
    ).toEqual({
      previousPeriodStart: JANUARY,
      previousPeriodPeakSeats: 6,
      currentPeriodPeakSeats: null,
    });
  });

  it('raises the peak to the seats about to be replaced when the period has not moved', () => {
    expect(
      resolveBillingPeriodBoundaryUpdate({
        incomingPeriodStart: FEBRUARY,
        storedSubscription: buildStoredSubscription({
          currentPeriodStart: FEBRUARY,
          currentPeriodEnd: MARCH,
          currentPeriodPeakSeats: 5,
          seats: 8,
        }),
      }),
    ).toEqual({ currentPeriodPeakSeats: 8 });
  });

  // Out-of-order events must not rewind the window the rollover settles against
  it('keeps the stored window when a late event carries an older one', () => {
    expect(
      resolveBillingPeriodBoundaryUpdate({
        incomingPeriodStart: JANUARY,
        storedSubscription: buildStoredSubscription({
          currentPeriodStart: FEBRUARY,
          currentPeriodEnd: MARCH,
          currentPeriodPeakSeats: 8,
          seats: 6,
        }),
      }),
    ).toEqual({
      currentPeriodStart: FEBRUARY,
      currentPeriodEnd: MARCH,
      currentPeriodPeakSeats: 8,
    });
  });

  it('has nothing to record for a subscription seen for the first time', () => {
    expect(
      resolveBillingPeriodBoundaryUpdate({
        incomingPeriodStart: FEBRUARY,
        storedSubscription: null,
      }),
    ).toEqual({});
  });

  it('has nothing to record when the event carries no period', () => {
    expect(
      resolveBillingPeriodBoundaryUpdate({
        incomingPeriodStart: undefined,
        storedSubscription: buildStoredSubscription({
          currentPeriodStart: JANUARY,
          currentPeriodEnd: FEBRUARY,
          currentPeriodPeakSeats: 8,
          seats: 6,
        }),
      }),
    ).toEqual({});
  });
});
