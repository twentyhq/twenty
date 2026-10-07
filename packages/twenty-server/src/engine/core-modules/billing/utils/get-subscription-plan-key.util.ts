/* @license Enterprise */

import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { type BillingProductMetadata } from 'src/engine/core-modules/billing/types/billing-product-metadata.type';

type SubscriptionItemWithProduct = {
  billingProduct?: {
    metadata?: Pick<BillingProductMetadata, 'productKey' | 'planKey'> | null;
  } | null;
};

export const getSubscriptionPlanKey = ({
  billingSubscriptionItems,
}: {
  billingSubscriptionItems: SubscriptionItemWithProduct[];
}): BillingPlanKey | null =>
  billingSubscriptionItems.find(
    ({ billingProduct }) =>
      billingProduct?.metadata?.productKey === BillingProductKey.BASE_PRODUCT,
  )?.billingProduct?.metadata?.planKey ?? null;
