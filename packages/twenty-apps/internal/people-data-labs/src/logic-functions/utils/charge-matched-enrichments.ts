import { chargeCredits } from 'twenty-sdk/billing';

import { BILLING_MARGIN_MULTIPLIER } from 'src/constants/billing-margin-multiplier';
import { MICRO_CREDITS_PER_DOLLAR } from 'src/constants/micro-credits-per-dollar';

export const chargeMatchedEnrichments = async ({
  matchedCount,
  costPerMatchDollars,
  resourceContext,
}: {
  matchedCount: number;
  costPerMatchDollars: number;
  resourceContext: string;
}): Promise<void> => {
  if (matchedCount === 0) {
    return;
  }

  const creditsPerMatchMicro = Math.floor(
    costPerMatchDollars * BILLING_MARGIN_MULTIPLIER * MICRO_CREDITS_PER_DOLLAR,
  );

  await chargeCredits({
    creditsUsedMicro: matchedCount * creditsPerMatchMicro,
    operationType: 'CODE_EXECUTION',
    quantity: matchedCount,
    resourceContext,
  });
};
