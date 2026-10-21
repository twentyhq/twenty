import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type OnboardingEnrichmentCreditRewardTier } from 'src/engine/core-modules/onboarding/types/onboarding-enrichment-credit-reward-tier.type';

// Hand-authored config: a malformed tier must drop out rather than coerce to a zero threshold that pays everyone.
const isUsableTier = (tier: OnboardingEnrichmentCreditRewardTier): boolean =>
  isNumber(tier?.minEmployeeCount) &&
  tier.minEmployeeCount >= 0 &&
  isNumber(tier?.amountMicro) &&
  tier.amountMicro > 0;

export const getOnboardingEnrichmentCreditRewardMicro = ({
  employeeCount,
  tiers,
}: {
  employeeCount: number | null;
  tiers: Record<string, OnboardingEnrichmentCreditRewardTier> | undefined;
}): { amountMicro: number | null; malformedTierKeys: string[] } => {
  if (!isDefined(tiers)) {
    return { amountMicro: null, malformedTierKeys: [] };
  }

  const entries = Object.entries(tiers);

  // Reported regardless of match so a mistyped tier surfaces on the first enrichment.
  const malformedTierKeys = entries
    .filter(([, tier]) => !isUsableTier(tier))
    .map(([key]) => key);

  if (!isNumber(employeeCount)) {
    return { amountMicro: null, malformedTierKeys };
  }

  // Tiers are keyed, not ordered, so the most generous match wins.
  const matchedAmounts = entries
    .filter(
      ([, tier]) =>
        isUsableTier(tier) && employeeCount >= tier.minEmployeeCount,
    )
    .map(([, tier]) => tier.amountMicro);

  return {
    amountMicro: matchedAmounts.length > 0 ? Math.max(...matchedAmounts) : null,
    malformedTierKeys,
  };
};
