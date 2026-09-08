/* @license Enterprise */

import { type BillingProductEntity } from 'src/engine/core-modules/billing/entities/billing-product.entity';

export const isSellableBillingProduct = (
  billingProduct: BillingProductEntity | undefined,
): boolean =>
  billingProduct?.active === true &&
  billingProduct.metadata?.isLegacy !== 'true';
