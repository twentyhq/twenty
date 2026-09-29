/* @license Enterprise */

import { findOrThrow } from 'twenty-shared/utils';

import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';

export const getCurrentResourceCreditSubscriptionItemOrThrow = (
  billingSubscription: BillingSubscriptionEntity,
) => {
  return findOrThrow(
    billingSubscription.billingSubscriptionItems,
    ({ billingProduct }) =>
      billingProduct?.metadata?.productKey ===
      BillingProductKey.RESOURCE_CREDIT,
  );
};
