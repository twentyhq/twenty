/* @license Enterprise */

import { type SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { type ApplicationSubscriptionItem } from 'src/engine/core-modules/billing/types/subscription-stripe-prices.type';
import { type TargetApplicationProduct } from 'src/engine/core-modules/billing/types/target-application-product.type';
import { findProductPriceForIntervalOrThrow } from 'src/engine/core-modules/billing/utils/find-product-price-for-interval-or-throw.util';

export const buildApplicationItemsForInterval = ({
  targetApplicationProducts,
  interval,
}: {
  targetApplicationProducts: TargetApplicationProduct[];
  interval: SubscriptionInterval;
}): ApplicationSubscriptionItem[] =>
  targetApplicationProducts.map(({ billingProduct, quantity }) => ({
    stripeProductId: billingProduct.stripeProductId,
    stripePriceId: findProductPriceForIntervalOrThrow(billingProduct, interval)
      .stripePriceId,
    quantity,
  }));
