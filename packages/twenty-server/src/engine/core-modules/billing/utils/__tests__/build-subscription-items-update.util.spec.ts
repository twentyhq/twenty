/* @license Enterprise */

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { buildSubscriptionItemsUpdate } from 'src/engine/core-modules/billing/utils/build-subscription-items-update.util';

const toUpdatePrices = {
  baseProductPriceId: 'price_base_year',
  seats: 7,
  resourceCreditPriceId: 'price_credits_year_1200',
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
  it('restates every item so none is left on the interval the subscription is leaving', () => {
    const items = buildSubscriptionItemsUpdate({
      billingSubscriptionItems: [
        baseItem,
        creditItem,
        {
          stripeSubscriptionItemId: 'si_add_on',
          stripePriceId: 'price_add_on_month',
          quantity: 1,
          billingProduct: {
            metadata: { productKey: BillingProductKey.ADD_ON },
          },
        },
      ],
      toUpdatePrices,
    });

    expect(items).toEqual([
      { id: 'si_base', price: 'price_base_year', quantity: 7 },
      { id: 'si_credit', price: 'price_credits_year_1200', quantity: 1 },
      { id: 'si_add_on', price: 'price_add_on_month', quantity: 1 },
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

  it('omits the quantity of an item that carries none', () => {
    const items = buildSubscriptionItemsUpdate({
      billingSubscriptionItems: [
        baseItem,
        {
          stripeSubscriptionItemId: 'si_metered',
          stripePriceId: 'price_metered',
          quantity: null,
          billingProduct: null,
        },
      ],
      toUpdatePrices,
    });

    expect(items[1]).toEqual({ id: 'si_metered', price: 'price_metered' });
  });
});
