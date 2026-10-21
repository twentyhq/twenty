/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import { type BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { type BillingProductMetadata } from 'src/engine/core-modules/billing/types/billing-product-metadata.type';
import { type SubscriptionStripePrices } from 'src/engine/core-modules/billing/types/subscription-stripe-prices.type';
import { resolveManagedItemPrice } from 'src/engine/core-modules/billing/utils/resolve-managed-item-price.util';

type SubscriptionItemToUpdate = Pick<
  BillingSubscriptionItemEntity,
  'stripeSubscriptionItemId'
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
  billingSubscriptionItems.flatMap(
    ({ stripeSubscriptionItemId, billingProduct }) => {
      const managedPrice = resolveManagedItemPrice({
        productKey: billingProduct?.metadata?.productKey,
        toUpdatePrices,
      });

      return isDefined(managedPrice)
        ? [{ id: stripeSubscriptionItemId, ...managedPrice }]
        : [];
    },
  );
