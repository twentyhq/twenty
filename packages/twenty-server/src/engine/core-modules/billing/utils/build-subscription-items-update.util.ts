/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import { type BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { type BillingProductMetadata } from 'src/engine/core-modules/billing/types/billing-product-metadata.type';
import { type SubscriptionStripePrices } from 'src/engine/core-modules/billing/types/subscription-stripe-prices.type';
import { resolveManagedItemPrice } from 'src/engine/core-modules/billing/utils/resolve-managed-item-price.util';

type SubscriptionItemToUpdate = Pick<
  BillingSubscriptionItemEntity,
  'stripeSubscriptionItemId' | 'stripePriceId' | 'quantity'
> & {
  billingProduct?: {
    metadata?: Pick<BillingProductMetadata, 'productKey'> | null;
  } | null;
};

export const buildSubscriptionItemsUpdate = ({
  billingSubscriptionItems,
  toUpdatePrices,
}: {
  billingSubscriptionItems: SubscriptionItemToUpdate[];
  toUpdatePrices: SubscriptionStripePrices;
}): Stripe.SubscriptionUpdateParams.Item[] =>
  billingSubscriptionItems.map(
    ({ stripeSubscriptionItemId, stripePriceId, quantity, billingProduct }) => {
      const managedPrice = resolveManagedItemPrice({
        productKey: billingProduct?.metadata?.productKey,
        toUpdatePrices,
      });

      return isDefined(managedPrice)
        ? { id: stripeSubscriptionItemId, ...managedPrice }
        : {
            id: stripeSubscriptionItemId,
            price: stripePriceId,
            ...(isDefined(quantity) ? { quantity } : {}),
          };
    },
  );
