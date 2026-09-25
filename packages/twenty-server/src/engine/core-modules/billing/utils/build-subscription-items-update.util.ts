/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import { type BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { type BillingProductMetadata } from 'src/engine/core-modules/billing/types/billing-product-metadata.type';
import { type SubscriptionStripePrices } from 'src/engine/core-modules/billing/types/subscription-stripe-prices.type';

type SubscriptionItemToUpdate = Pick<
  BillingSubscriptionItemEntity,
  'stripeSubscriptionItemId' | 'stripePriceId' | 'quantity'
> & {
  billingProduct?: {
    metadata?: Pick<BillingProductMetadata, 'productKey'> | null;
  } | null;
};

// Stripe leaves items missing from the payload untouched, so every item is restated.
export const buildSubscriptionItemsUpdate = ({
  billingSubscriptionItems,
  toUpdatePrices,
}: {
  billingSubscriptionItems: SubscriptionItemToUpdate[];
  toUpdatePrices: SubscriptionStripePrices;
}): Stripe.SubscriptionUpdateParams.Item[] =>
  billingSubscriptionItems.map(
    ({ stripeSubscriptionItemId, stripePriceId, quantity, billingProduct }) => {
      switch (billingProduct?.metadata?.productKey) {
        case BillingProductKey.BASE_PRODUCT:
          return {
            id: stripeSubscriptionItemId,
            price: toUpdatePrices.baseProductPriceId,
            quantity: toUpdatePrices.seats,
          };
        case BillingProductKey.RESOURCE_CREDIT:
          return {
            id: stripeSubscriptionItemId,
            price: toUpdatePrices.resourceCreditPriceId,
            quantity: 1,
          };
        default:
          return {
            id: stripeSubscriptionItemId,
            price: stripePriceId,
            ...(isDefined(quantity) ? { quantity } : {}),
          };
      }
    },
  );
