/* @license Enterprise */

// Prorated by quantity, so a charge straddling the end of the allowance pays only for the part beyond it
export const computeCreditsUsedMicroBeyondFreeAllowance = ({
  creditsUsedMicro,
  quantity,
  freeQuantityRemaining,
}: {
  creditsUsedMicro: number;
  quantity: number;
  freeQuantityRemaining: number;
}): number => {
  const freeQuantity = Math.min(quantity, Math.max(0, freeQuantityRemaining));

  return Math.round((creditsUsedMicro * (quantity - freeQuantity)) / quantity);
};
