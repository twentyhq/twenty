/* @license Enterprise */

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { isSellableBillingPrice } from 'src/engine/core-modules/billing/utils/is-sellable-billing-price.util';
import { isSellableBillingProduct } from 'src/engine/core-modules/billing/utils/is-sellable-billing-product.util';

// Callers pass prices already narrowed to a single plan and interval, so more than
// one match means two sellable packagings are live at once and the price we would
// charge depends on row order. Refuse rather than pick.
export const findSellableBaseProductPriceOrThrow = (
  billingPrices: BillingPriceEntity[],
): BillingPriceEntity => {
  const sellableBasePrices = billingPrices.filter(
    (billingPrice) =>
      billingPrice.billingProduct?.metadata.productKey ===
        BillingProductKey.BASE_PRODUCT &&
      isSellableBillingProduct(billingPrice.billingProduct) &&
      isSellableBillingPrice(billingPrice),
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
