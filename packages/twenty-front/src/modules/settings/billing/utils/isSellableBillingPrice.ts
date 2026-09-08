type BillingPriceSellability = {
  isSellable?: boolean | null;
};

// Strict rather than fail-open: the server always sets this, so an absent value
// means a stale payload, and letting a superseded price through would defeat the
// exactly-one checks it feeds.
export const isSellableBillingPrice = (billingPrice: BillingPriceSellability) =>
  billingPrice.isSellable === true;
