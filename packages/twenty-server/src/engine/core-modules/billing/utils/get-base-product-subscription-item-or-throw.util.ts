/* @license Enterprise */

import { findOrThrow } from 'twenty-shared/utils';

import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { type LicensedBillingSubscriptionItem } from 'src/engine/core-modules/billing/types/billing-subscription-item.type';

// V2 counterpart of get-licensed-billing-subscription-item-or-throw.util.ts
// Identifies the base plan item by productKey === BASE_PRODUCT (not quantity != null)
export const getBaseProductSubscriptionItemOrThrow = (
  billingSubscription: BillingSubscriptionEntity,
): LicensedBillingSubscriptionItem => {
  return findOrThrow(
    billingSubscription.billingSubscriptionItems,
    ({ billingProduct }) =>
      billingProduct.metadata.productKey === BillingProductKey.BASE_PRODUCT,
  ) as LicensedBillingSubscriptionItem;
};
