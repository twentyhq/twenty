export const PRE_REVIEW_VERDICTS = [
  'STRONG',
  'WORTH_A_LOOK',
  'WEAK',
  'SPAM',
] as const;

export type PreReviewVerdict = (typeof PRE_REVIEW_VERDICTS)[number];

// Lower is better. The SELECT option positions carry the same order, so sorting
// the inbox on preReviewVerdict ascending puts the best applications first.
export const PRE_REVIEW_VERDICT_RANK: Record<PreReviewVerdict, number> = {
  STRONG: 0,
  WORTH_A_LOOK: 1,
  WEAK: 2,
  SPAM: 3,
};

export const isPreReviewVerdict = (
  value: unknown,
): value is PreReviewVerdict =>
  typeof value === 'string' &&
  (PRE_REVIEW_VERDICTS as readonly string[]).includes(value);
