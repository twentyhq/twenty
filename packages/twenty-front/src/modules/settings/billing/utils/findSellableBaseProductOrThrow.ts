import { BillingProductKey } from '~/generated-metadata/graphql';

import { isSellableBillingProduct } from '@/settings/billing/utils/isSellableBillingProduct';

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
      `Expected a single sellable base product, found ${sellableBaseProducts.length}`,
    );
  }

  return sellableBaseProducts[0];
};
