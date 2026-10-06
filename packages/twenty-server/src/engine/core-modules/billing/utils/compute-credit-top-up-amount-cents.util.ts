/* @license Enterprise */

// BigInt because credits times cents passes 2^53 on large packs; rounded up so a top-up never undercharges
export const computeCreditTopUpAmountCents = ({
  creditAmountMicro,
  unitAmountCents,
  priceCreditAmountMicro,
}: {
  creditAmountMicro: number;
  unitAmountCents: number;
  priceCreditAmountMicro: number;
}): number => {
  const amount = BigInt(creditAmountMicro) * BigInt(unitAmountCents);
  const divisor = BigInt(priceCreditAmountMicro);

  return Number((amount + divisor - BigInt(1)) / divisor);
};
