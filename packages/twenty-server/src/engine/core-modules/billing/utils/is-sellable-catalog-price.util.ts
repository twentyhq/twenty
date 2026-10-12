/* @license Enterprise */

import { isSellableBillingPrice } from 'src/engine/core-modules/billing/utils/is-sellable-billing-price.util';
import { isSellableBillingProduct } from 'src/engine/core-modules/billing/utils/is-sellable-billing-product.util';

type SellableCatalogPrice = {
  active: boolean;
  metadata?: { isLegacy?: string | null } | null;
  billingProduct?: {
    active: boolean;
    metadata: { isLegacy?: string | null };
  } | null;
};

export const isSellableCatalogPrice = (
  billingPrice: SellableCatalogPrice,
): boolean =>
  isSellableBillingPrice(billingPrice) &&
  isSellableBillingProduct(billingPrice.billingProduct);
