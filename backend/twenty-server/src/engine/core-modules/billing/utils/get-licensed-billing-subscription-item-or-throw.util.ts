import { findOrThrow } from 'twenty-shared/utils';

import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { type LicensedBillingSubscriptionItem } from 'src/engine/core-modules/billing/types/billing-subscription-item.type';

export const getCurrentLicensedBillingSubscriptionItemOrThrow = (
  billingSubscription: BillingSubscriptionEntity,
) => {
  return findOrThrow(
    billingSubscription.billingSubscriptionItems,
    ({ billingProduct }) =>
      billingProduct.metadata.priceUsageBased === BillingUsageType.LICENSED,
  ) as LicensedBillingSubscriptionItem;
};
