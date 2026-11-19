/* @license Enterprise */

import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { computeApplicationPricesForIntervalOrThrow } from 'src/engine/core-modules/billing/utils/compute-application-prices-for-interval-or-throw.util';

const applicationProduct = {
  stripeProductId: 'prod_application',
  billingPrices: [
    {
      stripePriceId: 'price_application_month',
      interval: SubscriptionInterval.Month,
      active: true,
    },
    {
      stripePriceId: 'price_application_year',
      interval: SubscriptionInterval.Year,
      active: true,
    },
  ],
};

describe('computeApplicationPricesForIntervalOrThrow', () => {
  it('maps each application price to the price of its product at the interval', () => {
    expect(
      computeApplicationPricesForIntervalOrThrow({
        applicationPriceIds: ['price_application_month'],
        applicationPrices: [
          {
            stripePriceId: 'price_application_month',
            billingProduct: applicationProduct,
          },
        ],
        interval: SubscriptionInterval.Year,
      }),
    ).toEqual(new Map([['price_application_month', 'price_application_year']]));
  });

  it('returns an empty map when the subscription has no application item', () => {
    expect(
      computeApplicationPricesForIntervalOrThrow({
        applicationPriceIds: [],
        applicationPrices: [],
        interval: SubscriptionInterval.Year,
      }),
    ).toEqual(new Map());
  });

  it('throws when an application price is not in the catalog', () => {
    expect(() =>
      computeApplicationPricesForIntervalOrThrow({
        applicationPriceIds: ['price_application_month'],
        applicationPrices: [],
        interval: SubscriptionInterval.Year,
      }),
    ).toThrow(
      expect.objectContaining({
        code: BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
      }),
    );
  });

  it('throws when the product has no price at the interval', () => {
    expect(() =>
      computeApplicationPricesForIntervalOrThrow({
        applicationPriceIds: ['price_application_month'],
        applicationPrices: [
          {
            stripePriceId: 'price_application_month',
            billingProduct: {
              ...applicationProduct,
              billingPrices: [applicationProduct.billingPrices[0]],
            },
          },
        ],
        interval: SubscriptionInterval.Year,
      }),
    ).toThrow(
      expect.objectContaining({
        code: BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
      }),
    );
  });
});
