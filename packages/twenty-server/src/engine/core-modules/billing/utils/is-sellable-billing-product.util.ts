/* @license Enterprise */

type SellableBillingProduct = {
  active: boolean;
  metadata: { isLegacy?: string | null };
};

export const isSellableBillingProduct = (
  billingProduct: SellableBillingProduct | undefined | null,
): boolean =>
  billingProduct?.active === true &&
  billingProduct.metadata?.isLegacy !== 'true';
