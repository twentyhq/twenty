// Copied from packages/twenty-website/src/partners-marketplace/completeness-score.ts
// and is-ghost-partner.ts. Update both in the same change (see AGENTS.md).
export const MARKETPLACE_RANKING = {
  pointsPerCaseStudy: 4,
  maxCountedCaseStudies: 3,
  pointsPerCaseStudyCover: 1,
  introductionMinLength: 120,
  pointsForIntroduction: 2,
  pointsForService: 2,
  pointsForProfilePicture: 1,
  pointsForCalendarLink: 1,
  pointsForRateOrBudget: 1,
  pointsForCategory: 1,
  ghostIntroductionMaxLength: 40,
} as const;
