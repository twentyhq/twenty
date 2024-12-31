import Stripe from 'stripe';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { BillingProductMetadata } from 'src/engine/core-modules/billing/types/billing-product-metadata.type';

export function isStripeValidProductMetadata(
  metadata: Stripe.Metadata,
): metadata is BillingProductMetadata {
  if (Object.keys(metadata).length === 0) {
    return true;
  }
  const hasBillingPlanKey = isValidBillingPlanKey(metadata.planKey);
  const hasPriceUsageBased = isValidPriceUsageBased(metadata.priceUsageBased);

  return hasBillingPlanKey && hasPriceUsageBased;
}

const isValidBillingPlanKey = (planKey?: string) => {
  switch (planKey) {
    case BillingPlanKey.ENTERPRISE:
      return true;
    case BillingPlanKey.PRO:
      return true;
    default:
      return false;
  }
};

const isValidPriceUsageBased = (priceUsageBased?: string) => {
  switch (priceUsageBased) {
    case BillingUsageType.METERED:
      return true;
    case BillingUsageType.LICENSED:
      return true;
    default:
      return false;
  }
};
