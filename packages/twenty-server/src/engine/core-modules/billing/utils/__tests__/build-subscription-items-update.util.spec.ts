/* @license Enterprise */

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { buildSubscriptionItemsUpdate } from 'src/engine/core-modules/billing/utils/build-subscription-items-update.util';

const toUpdatePrices = {
  baseProductPriceId: 'price_base_year',
  seats: 7,
  resourceCreditPriceId: 'price_credits_year_1200',
  applicationPriceIds: [],
};

const baseItem = {
  stripeSubscriptionItemId: 'si_base',
  stripePriceId: 'price_base_month',
  billingProduct: {
    metadata: { productKey: BillingProductKey.BASE_PRODUCT },
  },
};

const creditItem = {
  stripeSubscriptionItemId: 'si_credit',
  stripePriceId: 'price_credits_month_100',
  billingProduct: {
    metadata: { productKey: BillingProductKey.RESOURCE_CREDIT },
  },
};

const applicationItem = {
  stripeSubscriptionItemId: 'si_application',
  stripePriceId: 'price_application_month',
  billingProduct: {
    metadata: { productKey: BillingProductKey.APPLICATION },
  },
};

const stripeSubscriptionItems = [
  { id: 'si_base', quantity: 3 },
  { id: 'si_credit', quantity: 1 },
  { id: 'si_application', quantity: 4 },
];

describe('buildSubscriptionItemsUpdate', () => {
  it('leaves an item it does not manage out of the payload, so Stripe keeps it as is', () => {
    const items = buildSubscriptionItemsUpdate({
      billingSubscriptionItems: [
        baseItem,
        creditItem,
        {
          stripeSubscriptionItemId: 'si_add_on',
          stripePriceId: 'price_add_on',
          billingProduct: null,
        },
      ],
      stripeSubscriptionItems,
      toUpdatePrices,
    });

    expect(items).toEqual([
      { id: 'si_base', price: 'price_base_year', quantity: 7 },
      { id: 'si_credit', price: 'price_credits_year_1200', quantity: 1 },
    ]);
  });

  it('rewrites the base and credit items whatever their position', () => {
    const items = buildSubscriptionItemsUpdate({
      billingSubscriptionItems: [creditItem, baseItem],
      stripeSubscriptionItems,
      toUpdatePrices,
    });

    expect(items).toEqual([
      { id: 'si_credit', price: 'price_credits_year_1200', quantity: 1 },
      { id: 'si_base', price: 'price_base_year', quantity: 7 },
    ]);
  });

  it('moves an application item to its price for the new interval with its Stripe quantity', () => {
    const items = buildSubscriptionItemsUpdate({
      billingSubscriptionItems: [baseItem, applicationItem],
      stripeSubscriptionItems,
      toUpdatePrices: {
        ...toUpdatePrices,
        targetApplicationPriceIdByCurrentPriceId: new Map([
          ['price_application_month', 'price_application_year'],
        ]),
      },
    });

    expect(items).toEqual([
      { id: 'si_base', price: 'price_base_year', quantity: 7 },
      { id: 'si_application', price: 'price_application_year', quantity: 4 },
    ]);
  });

  it('leaves an application item out when its price does not change', () => {
    const items = buildSubscriptionItemsUpdate({
      billingSubscriptionItems: [baseItem, applicationItem],
      stripeSubscriptionItems,
      toUpdatePrices: {
        ...toUpdatePrices,
        applicationPriceIds: ['price_application_month'],
      },
    });

    expect(items).toEqual([
      { id: 'si_base', price: 'price_base_year', quantity: 7 },
    ]);
  });

  it('leaves out an item whose product the catalog cannot classify', () => {
    const items = buildSubscriptionItemsUpdate({
      billingSubscriptionItems: [
        baseItem,
        {
          stripeSubscriptionItemId: 'si_metered',
          stripePriceId: 'price_metered',
          billingProduct: null,
        },
      ],
      stripeSubscriptionItems,
      toUpdatePrices,
    });

    expect(items).toEqual([
      { id: 'si_base', price: 'price_base_year', quantity: 7 },
    ]);
  });
});
