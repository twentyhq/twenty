import { describe, expect, it } from 'vitest';

import { MARKETPLACE_RANKING } from './marketplace-ranking.constant';

describe('MARKETPLACE_RANKING', () => {
  it('mirrors completeness-score.ts and is-ghost-partner.ts', () => {
    expect(MARKETPLACE_RANKING).toEqual({
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
    });
  });
});
