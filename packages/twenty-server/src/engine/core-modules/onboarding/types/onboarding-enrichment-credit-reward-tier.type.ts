// A band of enriched company data and what a workspace landing in it is worth.
// Conditions are additive over time: a qualification score will join
// minEmployeeCount here, and a tier missing the newer field keeps matching on
// the conditions it does carry.
export type OnboardingEnrichmentCreditRewardTier = {
  minEmployeeCount: number;
  amountMicro: number;
};
