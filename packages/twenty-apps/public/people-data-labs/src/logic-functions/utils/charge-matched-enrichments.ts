import { chargeCredits } from 'twenty-sdk/billing';

import { BILLING_MARGIN_MULTIPLIER } from 'src/constants/billing-margin-multiplier';
import { MICRO_CREDITS_PER_DOLLAR } from 'src/constants/micro-credits-per-dollar';
import { getCustomPdlApiKey } from 'src/logic-functions/utils/get-custom-pdl-api-key';
import { isDefined } from 'src/utils/is-defined';

export const chargeMatchedEnrichments = async ({
  matchedCount,
  costPerMatchDollars,
  resourceContext,
}: {
  matchedCount: number;
  costPerMatchDollars: number;
  resourceContext: string;
}): Promise<void> => {
  if (matchedCount === 0 || isDefined(getCustomPdlApiKey())) {
    return;
  }

  const creditsPerMatchMicro = Math.round(
    costPerMatchDollars * BILLING_MARGIN_MULTIPLIER * MICRO_CREDITS_PER_DOLLAR,
  );

  await chargeCredits({
    creditsUsedMicro: matchedCount * creditsPerMatchMicro,
    operationType: 'CODE_EXECUTION',
    quantity: matchedCount,
    resourceContext,
  });
};
