/* @license Enterprise */

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { buildSubscriptionItemsUpdate } from 'src/engine/core-modules/billing/utils/build-subscription-items-update.util';

const toUpdatePrices = {
  baseProductPriceId: 'price_base_year',
  seats: 7,
  resourceCreditPriceId: 'price_credits_year_1200',
  applicationPriceIdByCurrentPriceId: new Map<string, string>(),
};

const baseItem = {
  stripeSubscriptionItemId: 'si_base',
  stripePriceId: 'price_base_month',
  quantity: 3,
  billingProduct: {
    metadata: { productKey: BillingProductKey.BASE_PRODUCT },
  },
};

const creditItem = {
  stripeSubscriptionItemId: 'si_credit',
  stripePriceId: 'price_credits_month_100',
  quantity: 1,
  billingProduct: {
    metadata: { productKey: BillingProductKey.RESOURCE_CREDIT },
  },
};

describe('buildSubscriptionItemsUpdate', () => {
  it('leaves an item it does not manage out of the payload, so Stripe keeps it as is', () => {
    const items = buildSubscriptionItemsUpdate({
      billingSubscriptionItems: [
        baseItem,
        creditItem,
        {
          stripeSubscriptionItemId: 'si_add_on',
          billingProduct: null,
        },
      ],
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
      toUpdatePrices,
    });

    expect(items).toEqual([
      { id: 'si_credit', price: 'price_credits_year_1200', quantity: 1 },
      { id: 'si_base', price: 'price_base_year', quantity: 7 },
    ]);
  });

  it('moves an application item to its price for the new interval and keeps its quantity', () => {
    const items = buildSubscriptionItemsUpdate({
      billingSubscriptionItems: [
        baseItem,
        {
          stripeSubscriptionItemId: 'si_application',
          stripePriceId: 'price_application_month',
          quantity: 4,
          billingProduct: {
            metadata: { productKey: BillingProductKey.APPLICATION },
          },
        },
      ],
      toUpdatePrices: {
        ...toUpdatePrices,
        applicationPriceIdByCurrentPriceId: new Map([
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
      billingSubscriptionItems: [
        baseItem,
        {
          stripeSubscriptionItemId: 'si_application',
          stripePriceId: 'price_application_month',
          billingProduct: {
            metadata: { productKey: BillingProductKey.APPLICATION },
          },
        },
      ],
      toUpdatePrices: {
        ...toUpdatePrices,
        applicationPriceIdByCurrentPriceId: new Map([
          ['price_application_month', 'price_application_month'],
        ]),
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
        { stripeSubscriptionItemId: 'si_metered', billingProduct: null },
      ],
      toUpdatePrices,
    });

    expect(items).toEqual([
      { id: 'si_base', price: 'price_base_year', quantity: 7 },
    ]);
  });
});
