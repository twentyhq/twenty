/* @license Enterprise */

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { buildSubscriptionItemsUpdate } from 'src/engine/core-modules/billing/utils/build-subscription-items-update.util';

const currentPrices = {
  baseProductPriceId: 'price_base_month',
  seats: 3,
  resourceCreditPriceId: 'price_credits_month_100',
  applicationItems: [
    {
      stripeProductId: 'prod_application',
      stripePriceId: 'price_application_month',
      quantity: 3,
    },
  ],
};

const toUpdatePrices = {
  ...currentPrices,
  baseProductPriceId: 'price_base_year',
  seats: 7,
  resourceCreditPriceId: 'price_credits_year_1200',
};

const baseItem = {
  stripeSubscriptionItemId: 'si_base',
  billingProduct: { metadata: { productKey: BillingProductKey.BASE_PRODUCT } },
};

const creditItem = {
  stripeSubscriptionItemId: 'si_credit',
  billingProduct: {
    metadata: { productKey: BillingProductKey.RESOURCE_CREDIT },
  },
};

const stripeSubscriptionItems = [
  { id: 'si_base', price: { id: 'price_base_month' } },
  { id: 'si_credit', price: { id: 'price_credits_month_100' } },
  { id: 'si_application', price: { id: 'price_application_month' } },
];

describe('buildSubscriptionItemsUpdate', () => {
  it('rewrites the base and credit items whatever their position', () => {
    const items = buildSubscriptionItemsUpdate({
      billingSubscriptionItems: [creditItem, baseItem],
      stripeSubscriptionItems,
      currentPrices,
      toUpdatePrices,
    });

    expect(items).toEqual([
      { id: 'si_credit', price: 'price_credits_year_1200', quantity: 1 },
      { id: 'si_base', price: 'price_base_year', quantity: 7 },
    ]);
  });

  it('leaves an item it does not manage out of the payload, so Stripe keeps it as is', () => {
    const items = buildSubscriptionItemsUpdate({
      billingSubscriptionItems: [
        baseItem,
        { stripeSubscriptionItemId: 'si_add_on', billingProduct: null },
      ],
      stripeSubscriptionItems: [
        ...stripeSubscriptionItems,
        { id: 'si_add_on', price: { id: 'price_add_on' } },
      ],
      currentPrices,
      toUpdatePrices,
    });

    expect(items).toEqual([
      { id: 'si_base', price: 'price_base_year', quantity: 7 },
    ]);
  });

  it('moves an application item to the price of the same product in place', () => {
    const items = buildSubscriptionItemsUpdate({
      billingSubscriptionItems: [baseItem],
      stripeSubscriptionItems,
      currentPrices,
      toUpdatePrices: {
        ...toUpdatePrices,
        applicationItems: [
          {
            stripeProductId: 'prod_application',
            stripePriceId: 'price_application_year',
            quantity: 7,
          },
        ],
      },
    });

    expect(items).toEqual([
      { id: 'si_base', price: 'price_base_year', quantity: 7 },
      { id: 'si_application', price: 'price_application_year', quantity: 7 },
    ]);
  });

  it('adds an installed application and deletes an uninstalled one', () => {
    const items = buildSubscriptionItemsUpdate({
      billingSubscriptionItems: [],
      stripeSubscriptionItems,
      currentPrices,
      toUpdatePrices: {
        ...currentPrices,
        applicationItems: [
          {
            stripeProductId: 'prod_other_application',
            stripePriceId: 'price_other_application_month',
            quantity: 1,
          },
        ],
      },
    });

    expect(items).toEqual([
      { price: 'price_other_application_month', quantity: 1 },
      { id: 'si_application', deleted: true },
    ]);
  });
});
