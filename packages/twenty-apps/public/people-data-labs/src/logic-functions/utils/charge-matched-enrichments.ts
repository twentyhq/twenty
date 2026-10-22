import { chargeCredits } from 'twenty-sdk/billing';

import { MICRO_CREDITS_PER_DOLLAR } from 'src/constants/micro-credits-per-dollar';

export const chargeMatchedEnrichments = async ({
  matchedCount,
  pricePerMatchDollars,
  resourceContext,
}: {
  matchedCount: number;
  pricePerMatchDollars: number;
  resourceContext: string;
}): Promise<void> => {
  if (matchedCount === 0) {
    return;
  }

  const creditsPerMatchMicro = Math.round(
    pricePerMatchDollars * MICRO_CREDITS_PER_DOLLAR,
  );

  await chargeCredits({
    creditsUsedMicro: matchedCount * creditsPerMatchMicro,
    operationType: 'CODE_EXECUTION',
    quantity: matchedCount,
    resourceContext,
  });
};
