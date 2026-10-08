type BillingPriceSellability = {
  isSellable?: boolean | null;
};

// Strict: the server always sets this, so absence means a stale payload, and letting a superseded
// price through would defeat the exactly-one checks this feeds.
export const isSellableBillingPrice = (billingPrice: BillingPriceSellability) =>
  billingPrice.isSellable === true;
