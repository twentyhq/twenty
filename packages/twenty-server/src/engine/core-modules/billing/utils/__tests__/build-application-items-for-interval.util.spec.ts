/* @license Enterprise */

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { buildApplicationItemsForInterval } from 'src/engine/core-modules/billing/utils/build-application-items-for-interval.util';

const billingProduct = {
  stripeProductId: 'prod_application',
  billingPrices: [
    {
      stripePriceId: 'price_application_month',
      interval: SubscriptionInterval.Month,
      active: true,
      metadata: {},
    },
    {
      stripePriceId: 'price_application_year',
      interval: SubscriptionInterval.Year,
      active: true,
      metadata: {},
    },
  ],
};

describe('buildApplicationItemsForInterval', () => {
  it.each([
    [SubscriptionInterval.Month, 'price_application_month'],
    [SubscriptionInterval.Year, 'price_application_year'],
  ])('takes the %s price of each target product', (interval, stripePriceId) => {
    expect(
      buildApplicationItemsForInterval({
        targetApplicationProducts: [
          {
            billingProduct,
            quantity: 4,
          },
        ],
        interval,
      }),
    ).toEqual([
      { stripeProductId: 'prod_application', stripePriceId, quantity: 4 },
    ]);
  });
});
