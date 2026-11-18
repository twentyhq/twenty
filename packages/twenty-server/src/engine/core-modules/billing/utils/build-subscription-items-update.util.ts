/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import { type BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { type BillingProductMetadata } from 'src/engine/core-modules/billing/types/billing-product-metadata.type';
import { type SubscriptionStripePrices } from 'src/engine/core-modules/billing/types/subscription-stripe-prices.type';
import { resolveManagedItemPrice } from 'src/engine/core-modules/billing/utils/resolve-managed-item-price.util';

type SubscriptionItemToUpdate = Pick<
  BillingSubscriptionItemEntity,
  'stripeSubscriptionItemId' | 'stripePriceId'
> & {
  billingProduct?: {
    metadata?: Pick<BillingProductMetadata, 'productKey'> | null;
  } | null;
};

export const buildSubscriptionItemsUpdate = ({
  billingSubscriptionItems,
  stripeSubscriptionItems,
  toUpdatePrices,
}: {
  billingSubscriptionItems: SubscriptionItemToUpdate[];
  stripeSubscriptionItems: Pick<Stripe.SubscriptionItem, 'id' | 'quantity'>[];
  toUpdatePrices: SubscriptionStripePrices;
}): Stripe.SubscriptionUpdateParams.Item[] =>
  billingSubscriptionItems.flatMap(
    ({ stripeSubscriptionItemId, stripePriceId, billingProduct }) => {
      const managedPrice = resolveManagedItemPrice({
        productKey: billingProduct?.metadata?.productKey,
        toUpdatePrices,
      });

      if (isDefined(managedPrice)) {
        return [{ id: stripeSubscriptionItemId, ...managedPrice }];
      }

      const applicationPriceId =
        toUpdatePrices.targetApplicationPriceIdByCurrentPriceId?.get(
          stripePriceId,
        );

      return isDefined(applicationPriceId) &&
        applicationPriceId !== stripePriceId
        ? [
            {
              id: stripeSubscriptionItemId,
              price: applicationPriceId,
              quantity: stripeSubscriptionItems.find(
                ({ id }) => id === stripeSubscriptionItemId,
              )?.quantity,
            },
          ]
        : [];
    },
  );
