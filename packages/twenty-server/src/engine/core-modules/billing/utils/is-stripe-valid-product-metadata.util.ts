/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { type BillingProductMetadata } from 'src/engine/core-modules/billing/types/billing-product-metadata.type';

export function isStripeValidProductMetadata(
  metadata: Stripe.Metadata | BillingProductMetadata,
): metadata is BillingProductMetadata {
  if (Object.keys(metadata).length === 0) {
    return true;
  }
  const hasBillingPlanKey = isValidEnumValue(metadata.planKey, BillingPlanKey);
  const isPlanKeyOptional =
    metadata.productKey === BillingProductKey.APPLICATION &&
    !isDefined(metadata.planKey);
  const hasProductKey = isValidEnumValue(
    metadata.productKey,
    BillingProductKey,
  );

  return (hasBillingPlanKey || isPlanKeyOptional) && hasProductKey;
}

const isValidEnumValue = <T>(
  value: string | undefined,
  enumObject: Record<string, T>,
): boolean => {
  return Object.values(enumObject).includes(value as T);
};
