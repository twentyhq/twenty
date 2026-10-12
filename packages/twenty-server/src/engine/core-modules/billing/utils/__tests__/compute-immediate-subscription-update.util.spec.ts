/* @license Enterprise */

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionUpdateType } from 'src/engine/core-modules/billing/types/billing-subscription-update.type';
import { computeImmediateSubscriptionUpdate } from 'src/engine/core-modules/billing/utils/compute-immediate-subscription-update.util';

const subscriptionUpdate = {
  type: SubscriptionUpdateType.INTERVAL,
  newInterval: SubscriptionInterval.Year,
} as const;

const currentPrices = {
  baseProductPriceId: 'price_base_year',
  seats: 3,
  resourceCreditPriceId: 'price_credit_year',
};

describe('computeImmediateSubscriptionUpdate', () => {
  it('returns undefined when prices and seats are unchanged', () => {
    expect(
      computeImmediateSubscriptionUpdate({
        subscriptionUpdate,
        currentPrices,
        toUpdatePrices: currentPrices,
      }),
    ).toBeUndefined();
  });

  it('returns the requested update when the base price changes', () => {
    expect(
      computeImmediateSubscriptionUpdate({
        subscriptionUpdate,
        currentPrices,
        toUpdatePrices: {
          ...currentPrices,
          baseProductPriceId: 'price_base_month',
        },
      }),
    ).toBe(subscriptionUpdate);
  });

  it('returns the requested update when the resource credit price changes', () => {
    expect(
      computeImmediateSubscriptionUpdate({
        subscriptionUpdate,
        currentPrices,
        toUpdatePrices: {
          ...currentPrices,
          resourceCreditPriceId: 'price_credit_month',
        },
      }),
    ).toBe(subscriptionUpdate);
  });

  it('returns a seats update when only the seat count changes', () => {
    expect(
      computeImmediateSubscriptionUpdate({
        subscriptionUpdate,
        currentPrices,
        toUpdatePrices: { ...currentPrices, seats: 4 },
      }),
    ).toEqual({ type: SubscriptionUpdateType.SEATS, newSeats: 4 });
  });

  it('returns the requested update when a price and the seat count both change', () => {
    expect(
      computeImmediateSubscriptionUpdate({
        subscriptionUpdate,
        currentPrices,
        toUpdatePrices: {
          ...currentPrices,
          baseProductPriceId: 'price_base_month',
          seats: 4,
        },
      }),
    ).toBe(subscriptionUpdate);
  });
});
