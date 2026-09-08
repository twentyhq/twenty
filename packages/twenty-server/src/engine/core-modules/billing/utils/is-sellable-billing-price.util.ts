/* @license Enterprise */

import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';

export const isSellableBillingPrice = (
  billingPrice: BillingPriceEntity,
): boolean => billingPrice.active && billingPrice.metadata?.isLegacy !== 'true';
