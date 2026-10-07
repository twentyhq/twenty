/* @license Enterprise */

import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';

import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';

export const computeCreditOneTimeTopUpUnitPriceCents = (
  price: Pick<BillingPriceEntity, 'unitAmount' | 'metadata'>,
): number => {
  const amount =
    BigInt(Number(price.unitAmount)) *
    BigInt(INTERNAL_CREDITS_PER_DISPLAY_CREDIT);
  const divisor = BigInt(Number(price.metadata?.credit_amount));

  return Number((amount + divisor - BigInt(1)) / divisor);
};
