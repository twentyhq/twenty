/* @license Enterprise */

import { findOrThrow } from 'twenty-shared/utils';

import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { type BaseProductSubscriptionItem } from 'src/engine/core-modules/billing/types/base-product-subscription-item.type';
import { isBaseProductSubscriptionItem } from 'src/engine/core-modules/billing/utils/is-base-product-subscription-item.util';

export const getBaseProductSubscriptionItemOrThrow = (
  billingSubscription: BillingSubscriptionEntity,
): BaseProductSubscriptionItem => {
  return findOrThrow(
    billingSubscription.billingSubscriptionItems,
    isBaseProductSubscriptionItem,
  ) as BaseProductSubscriptionItem;
};
