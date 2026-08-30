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
}): number | null => {
  if (!isNumber(employeeCount) || !isDefined(tiers)) {
    return null;
  }

  // Tiers are keyed for legibility, not ordered, so every one is measured and
  // the most generous match is the one owed.
  const matchedTiers = Object.values(tiers).filter(
    (tier) => isUsableTier(tier) && employeeCount >= tier.minEmployeeCount,
  );

  if (matchedTiers.length === 0) {
    return null;
  }

  return Math.max(...matchedTiers.map((tier) => tier.amountMicro));
};
