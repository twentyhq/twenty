import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type OnboardingEnrichmentCreditRewardTier } from 'src/engine/core-modules/onboarding/types/onboarding-enrichment-credit-reward-tier.type';

// Tiers are hand-authored config, so a malformed entry must drop out rather
// than coerce into a threshold of zero and pay every matched workspace.
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

  // Reported whatever the employee count, so a mistyped tier surfaces on the
  // first enrichment after the config change rather than waiting for a
  // workspace that would have matched it.
  const malformedTierKeys = entries
    .filter(([, tier]) => !isUsableTier(tier))
    .map(([key]) => key);

  if (!isNumber(employeeCount)) {
    return { amountMicro: null, malformedTierKeys };
  }

  // Tiers are keyed for legibility, not ordered, so every one is measured and
  // the most generous match is the one owed.
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
