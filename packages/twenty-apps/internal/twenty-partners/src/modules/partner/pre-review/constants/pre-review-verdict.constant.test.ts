import { describe, expect, it } from 'vitest';

import {
  PRE_REVIEW_VERDICTS,
  PRE_REVIEW_VERDICT_RANK,
  isPreReviewVerdict,
} from './pre-review-verdict.constant';

describe('pre-review verdict taxonomy', () => {
  it('lists the four verdicts best-first', () => {
    expect(PRE_REVIEW_VERDICTS).toEqual([
      'STRONG',
      'WORTH_A_LOOK',
      'WEAK',
      'SPAM',
    ]);
  });

  it('ranks STRONG best and SPAM worst', () => {
    expect(PRE_REVIEW_VERDICT_RANK.STRONG).toBe(0);
    expect(PRE_REVIEW_VERDICT_RANK.WORTH_A_LOOK).toBe(1);
    expect(PRE_REVIEW_VERDICT_RANK.WEAK).toBe(2);
    expect(PRE_REVIEW_VERDICT_RANK.SPAM).toBe(3);
  });

  it('recognises only the four verdict strings', () => {
    expect(isPreReviewVerdict('STRONG')).toBe(true);
    expect(isPreReviewVerdict('worth_a_look')).toBe(false);
    expect(isPreReviewVerdict('')).toBe(false);
    expect(isPreReviewVerdict(null)).toBe(false);
    expect(isPreReviewVerdict(0)).toBe(false);
  });
});
