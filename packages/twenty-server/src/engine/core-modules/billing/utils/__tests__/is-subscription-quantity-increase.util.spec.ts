/* @license Enterprise */

import { isSubscriptionQuantityIncrease } from 'src/engine/core-modules/billing/utils/is-subscription-quantity-increase.util';

const applicationItem = {
  stripeProductId: 'prod_application',
  stripePriceId: 'price_application_month',
  quantity: 3,
};

const currentPrices = {
  baseProductPriceId: 'price_base_month',
  seats: 3,
  resourceCreditPriceId: 'price_credit_month',
  applicationItems: [applicationItem],
};

describe('isSubscriptionQuantityIncrease', () => {
  it.each([
    ['seats go up', { seats: 4 }],
    [
      'an application item quantity goes up',
      { applicationItems: [{ ...applicationItem, quantity: 4 }] },
    ],
    [
      'an application item is added',
      {
        applicationItems: [
          applicationItem,
          { ...applicationItem, stripeProductId: 'prod_other_application' },
        ],
      },
    ],
  ])('is true when %s', (_, toUpdate) => {
    expect(
      isSubscriptionQuantityIncrease({
        currentPrices,
        toUpdatePrices: { ...currentPrices, ...toUpdate },
      }),
    ).toBe(true);
  });

  it.each([
    ['nothing changes', {}],
    ['seats go down', { seats: 2 }],
    ['an application item is removed', { applicationItems: [] }],
  ])('is false when %s', (_, toUpdate) => {
    expect(
      isSubscriptionQuantityIncrease({
        currentPrices,
        toUpdatePrices: { ...currentPrices, ...toUpdate },
      }),
    ).toBe(false);
  });
});
