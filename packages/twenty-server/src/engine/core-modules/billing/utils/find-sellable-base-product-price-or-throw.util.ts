/* @license Enterprise */

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { isSellableCatalogPrice } from 'src/engine/core-modules/billing/utils/is-sellable-catalog-price.util';

type SellableBaseProductPrice = {
  active: boolean;
  stripePriceId: string;
  metadata?: { isLegacy?: string | null } | null;
  billingProduct?: {
    active: boolean;
    metadata: { productKey: BillingProductKey; isLegacy?: string | null };
  } | null;
};

// Callers pass prices already narrowed to a single plan and interval, so more than
// one match means two sellable packagings are live at once and the price we would
// charge depends on row order. Refuse rather than pick.
export const findSellableBaseProductPriceOrThrow = <
  TPrice extends SellableBaseProductPrice,
>(
  billingPrices: TPrice[],
): TPrice => {
  const sellableBasePrices = billingPrices.filter(
    (billingPrice) =>
      billingPrice.billingProduct?.metadata.productKey ===
        BillingProductKey.BASE_PRODUCT && isSellableCatalogPrice(billingPrice),
  );

  if (sellableBasePrices.length === 0) {
    throw new BillingException(
      'No sellable base product price found',
      BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
    );
  }

  if (sellableBasePrices.length > 1) {
    throw new BillingException(
      `Expected a single sellable base product price, found ${sellableBasePrices.length}: ${sellableBasePrices
        .map((billingPrice) => billingPrice.stripePriceId)
        .join(
          ', ',
        )}. Mark the superseded product or price with metadata isLegacy=true.`,
      BillingExceptionCode.BILLING_PRICE_INVALID,
    );
  }

  return sellableBasePrices[0];
};
