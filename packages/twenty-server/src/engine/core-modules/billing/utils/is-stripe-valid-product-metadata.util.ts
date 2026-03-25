/* @license Enterprise */

import type Stripe from 'stripe';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { type BillingProductMetadata } from 'src/engine/core-modules/billing/types/billing-product-metadata.type';

export function isStripeValidProductMetadata(
  metadata: Stripe.Metadata,
): metadata is BillingProductMetadata {
  if (Object.keys(metadata).length === 0) {
    return true;
  }
  const hasBillingPlanKey = isValidEnumValue(metadata.planKey, BillingPlanKey);
  const hasPriceUsageBased = isValidEnumValue(
    metadata.priceUsageBased,
    BillingUsageType,
  );
  const hasProductKey = isValidEnumValue(
    metadata.productKey,
    BillingProductKey,
  );

  return hasBillingPlanKey && hasPriceUsageBased && hasProductKey;
}

const isValidEnumValue = <T>(
  value: string | undefined,
  enumObject: Record<string, T>,
): boolean => {
  return Object.values(enumObject).includes(value as T);
};
