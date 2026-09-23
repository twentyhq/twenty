type BillingProductSellability = {
  metadata: { isLegacy?: string | null };
};

export const isSellableBillingProduct = (
  billingProduct: BillingProductSellability,
) => billingProduct.metadata.isLegacy !== 'true';
