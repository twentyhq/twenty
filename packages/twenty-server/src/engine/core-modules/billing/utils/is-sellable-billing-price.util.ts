/* @license Enterprise */

type SellableBillingPrice = {
  active: boolean;
  metadata?: { isLegacy?: string | null } | null;
};

export const isSellableBillingPrice = (
  billingPrice: SellableBillingPrice,
): boolean => billingPrice.active && billingPrice.metadata?.isLegacy !== 'true';
