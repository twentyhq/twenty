type BillingPriceSellability = {
  isSellable?: boolean | null;
};

export const isSellableBillingPrice = (billingPrice: BillingPriceSellability) =>
  billingPrice.isSellable !== false;
