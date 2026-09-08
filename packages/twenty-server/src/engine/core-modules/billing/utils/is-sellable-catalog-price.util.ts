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

// A price is only sellable if its product is too, so superseding a whole
// packaging takes all of its prices out of circulation in one edit.
export const isSellableCatalogPrice = (
  billingPrice: SellableCatalogPrice,
): boolean =>
  isSellableBillingPrice(billingPrice) &&
  isSellableBillingProduct(billingPrice.billingProduct);
