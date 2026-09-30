/* @license Enterprise */

import { findOrThrow } from 'twenty-shared/utils';

import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { type BaseProductSubscriptionItem } from 'src/engine/core-modules/billing/types/base-product-subscription-item.type';

export const getBaseProductSubscriptionItemOrThrow = (
  billingSubscription: BillingSubscriptionEntity,
): BaseProductSubscriptionItem => {
  return findOrThrow(
    billingSubscription.billingSubscriptionItems,
    ({ billingProduct }) =>
      billingProduct?.metadata?.productKey === BillingProductKey.BASE_PRODUCT,
  ) as BaseProductSubscriptionItem;
};
