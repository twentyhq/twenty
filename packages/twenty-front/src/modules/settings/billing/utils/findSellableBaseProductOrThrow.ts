import { BillingProductKey } from '~/generated-metadata/graphql';

import { isSellableBillingProduct } from '@/settings/billing/utils/isSellableBillingProduct';
import { doNotTranslate } from 'twenty-shared/i18n';

type SellableBaseProductCandidate = {
  metadata: { productKey: BillingProductKey; isLegacy?: string | null };
};

// Mirrors the server: with two live sellable products the shown price would depend on catalog order.
export const findSellableBaseProductOrThrow = <
  TProduct extends SellableBaseProductCandidate,
>(
  baseProducts: TProduct[],
): TProduct => {
  const sellableBaseProducts = baseProducts.filter(
    (product) =>
      product.metadata.productKey === BillingProductKey.BASE_PRODUCT &&
      isSellableBillingProduct(product),
  );

  if (sellableBaseProducts.length !== 1) {
    throw new Error(
      doNotTranslate(
        `Expected a single sellable base product, found ${sellableBaseProducts.length}`,
      ),
    );
  }

  return sellableBaseProducts[0];
};
