import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { buildApplicationStripePriceParams } from 'src/engine/core-modules/billing/utils/build-application-stripe-price-params.util';

describe('buildApplicationStripePriceParams', () => {
  it('bills the declared amount every month', () => {
    expect(
      buildApplicationStripePriceParams({
        stripeProductId: 'app_price_1',
        price: { amountCents: 1000 },
        interval: SubscriptionInterval.Month,
      }),
    ).toEqual({
      product: 'app_price_1',
      currency: 'usd',
      unit_amount: 1000,
      recurring: { interval: 'month' },
    });
  });

  it('bills twelve times the declared amount every year', () => {
    expect(
      buildApplicationStripePriceParams({
        stripeProductId: 'app_price_1',
        price: { amountCents: 1000 },
        interval: SubscriptionInterval.Year,
      }),
    ).toEqual({
      product: 'app_price_1',
      currency: 'usd',
      unit_amount: 12000,
      recurring: { interval: 'year' },
    });
  });
});
