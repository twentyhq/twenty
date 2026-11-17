/* @license Enterprise */

import { type BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { computeBillingPeriodUpdate } from 'src/engine/core-modules/billing/utils/compute-billing-period-update.util';

const JANUARY = new Date('2026-01-01T00:00:00.000Z');
const FEBRUARY = new Date('2026-02-01T00:00:00.000Z');
const MARCH = new Date('2026-03-01T00:00:00.000Z');

const buildStoredSubscription = ({
  currentPeriodStart,
  currentPeriodEnd,
  currentPeriodMaxSeats,
  seats,
}: {
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  currentPeriodMaxSeats: number | null;
  seats: number;
}) => ({
  currentPeriodStart,
  currentPeriodEnd,
  currentPeriodMaxSeats,
  billingSubscriptionItems: [
    {
      quantity: seats,
      billingProduct: {
        metadata: { productKey: BillingProductKey.BASE_PRODUCT },
      },
    } as BillingSubscriptionItemEntity,
  ],
});

describe('computeBillingPeriodUpdate', () => {
  it('records the period the subscription just moved off with its max seats', () => {
    expect(
      computeBillingPeriodUpdate({
        incomingPeriodStart: FEBRUARY,
        storedSubscription: buildStoredSubscription({
          currentPeriodStart: JANUARY,
          currentPeriodEnd: FEBRUARY,
          currentPeriodMaxSeats: 8,
          seats: 6,
        }),
      }),
    ).toEqual({
      previousPeriodStart: JANUARY,
      previousPeriodMaxSeats: 8,
      currentPeriodMaxSeats: null,
    });
  });

  it('keeps the seats held at the end of the period when no max seats were recorded', () => {
    expect(
      computeBillingPeriodUpdate({
        incomingPeriodStart: FEBRUARY,
        storedSubscription: buildStoredSubscription({
          currentPeriodStart: JANUARY,
          currentPeriodEnd: FEBRUARY,
          currentPeriodMaxSeats: null,
          seats: 6,
        }),
      }),
    ).toEqual({
      previousPeriodStart: JANUARY,
      previousPeriodMaxSeats: 6,
      currentPeriodMaxSeats: null,
    });
  });

  it('raises the max seats to the seats about to be replaced when the period has not moved', () => {
    expect(
      computeBillingPeriodUpdate({
        incomingPeriodStart: FEBRUARY,
        storedSubscription: buildStoredSubscription({
          currentPeriodStart: FEBRUARY,
          currentPeriodEnd: MARCH,
          currentPeriodMaxSeats: 5,
          seats: 8,
        }),
      }),
    ).toEqual({ currentPeriodMaxSeats: 8 });
  });

  it('drops the seats about to be replaced from the max seats on the renewal seat sync of the period', () => {
    expect(
      computeBillingPeriodUpdate({
        incomingPeriodStart: FEBRUARY,
        storedSubscription: buildStoredSubscription({
          currentPeriodStart: FEBRUARY,
          currentPeriodEnd: MARCH,
          currentPeriodMaxSeats: null,
          seats: 20,
        }),
        renewalDate: FEBRUARY,
      }),
    ).toEqual({ currentPeriodMaxSeats: null });
  });

  it('keeps the max seats when the renewal seat sync belongs to an older period', () => {
    expect(
      computeBillingPeriodUpdate({
        incomingPeriodStart: FEBRUARY,
        storedSubscription: buildStoredSubscription({
          currentPeriodStart: FEBRUARY,
          currentPeriodEnd: MARCH,
          currentPeriodMaxSeats: 8,
          seats: 5,
        }),
        renewalDate: JANUARY,
      }),
    ).toEqual({ currentPeriodMaxSeats: 8 });
  });

  it('still records the period the subscription moved off on the renewal seat sync', () => {
    expect(
      computeBillingPeriodUpdate({
        incomingPeriodStart: FEBRUARY,
        storedSubscription: buildStoredSubscription({
          currentPeriodStart: JANUARY,
          currentPeriodEnd: FEBRUARY,
          currentPeriodMaxSeats: 20,
          seats: 20,
        }),
        renewalDate: FEBRUARY,
      }),
    ).toEqual({
      previousPeriodStart: JANUARY,
      previousPeriodMaxSeats: 20,
      currentPeriodMaxSeats: null,
    });
  });

  // Out-of-order events must not rewind the window the rollover settles against
  it('keeps the stored window when a late event carries an older one', () => {
    expect(
      computeBillingPeriodUpdate({
        incomingPeriodStart: JANUARY,
        storedSubscription: buildStoredSubscription({
          currentPeriodStart: FEBRUARY,
          currentPeriodEnd: MARCH,
          currentPeriodMaxSeats: 8,
          seats: 6,
        }),
      }),
    ).toEqual({
      currentPeriodStart: FEBRUARY,
      currentPeriodEnd: MARCH,
      currentPeriodMaxSeats: 8,
    });
  });

  it('has nothing to record for a subscription seen for the first time', () => {
    expect(
      computeBillingPeriodUpdate({
        incomingPeriodStart: FEBRUARY,
        storedSubscription: null,
      }),
    ).toEqual({});
  });

  it('has nothing to record when the event carries no period', () => {
    expect(
      computeBillingPeriodUpdate({
        incomingPeriodStart: undefined,
        storedSubscription: buildStoredSubscription({
          currentPeriodStart: JANUARY,
          currentPeriodEnd: FEBRUARY,
          currentPeriodMaxSeats: 8,
          seats: 6,
        }),
      }),
    ).toEqual({});
  });
});
