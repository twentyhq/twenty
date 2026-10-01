type BillingPriceSellability = {
  isSellable?: boolean | null;
};

// Strict: the server always sets this, so absence means a stale payload.
export const isSellableBillingPrice = (billingPrice: BillingPriceSellability) =>
  billingPrice.isSellable === true;
