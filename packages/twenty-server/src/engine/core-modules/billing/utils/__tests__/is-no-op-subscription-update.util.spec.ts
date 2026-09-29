/* @license Enterprise */

import { isNoOpSubscriptionUpdate } from 'src/engine/core-modules/billing/utils/is-no-op-subscription-update.util';

const current = {
  currentLicensedPriceId: 'price_base_year',
  currentResourceCreditPriceId: 'price_credit_year',
  currentSeats: 3,
};

const toUpdatePrices = {
  licensedPriceId: 'price_base_year',
  seats: 3,
  resourceCreditPriceId: 'price_credit_year',
};

describe('isNoOpSubscriptionUpdate', () => {
  it('is true when the update restates the prices and seats already in place', () => {
    expect(isNoOpSubscriptionUpdate({ toUpdatePrices, ...current })).toBe(true);
  });

  it('is false when the base price moves', () => {
    expect(
      isNoOpSubscriptionUpdate({
        toUpdatePrices: {
          ...toUpdatePrices,
          licensedPriceId: 'price_base_month',
        },
        ...current,
      }),
    ).toBe(false);
  });

  it('is false when the resource credit price moves', () => {
    expect(
      isNoOpSubscriptionUpdate({
        toUpdatePrices: {
          ...toUpdatePrices,
          resourceCreditPriceId: 'price_credit_month',
        },
        ...current,
      }),
    ).toBe(false);
  });

  it('is false when the seat count moves', () => {
    expect(
      isNoOpSubscriptionUpdate({
        toUpdatePrices: { ...toUpdatePrices, seats: 4 },
        ...current,
      }),
    ).toBe(false);
  });

  it('is false when the subscription carries no seat count', () => {
    expect(
      isNoOpSubscriptionUpdate({
        toUpdatePrices,
        ...current,
        currentSeats: null,
      }),
    ).toBe(false);
  });
});
