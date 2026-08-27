import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { MARKETPLACE_RANKING } from './marketplace-ranking.constant';

// Read website sources as text: twenty-partners must not import twenty-website.

const PACKAGES_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../../../../../',
);

const COMPLETENESS_SOURCE = readFileSync(
  resolve(
    PACKAGES_ROOT,
    'twenty-website/src/partners-marketplace/completeness-score.ts',
  ),
  'utf8',
);

const GHOST_SOURCE = readFileSync(
  resolve(
    PACKAGES_ROOT,
    'twenty-website/src/partners-marketplace/is-ghost-partner.ts',
  ),
  'utf8',
);

describe('MARKETPLACE_RANKING', () => {
  it('matches the named exports in completeness-score.ts and is-ghost-partner.ts', () => {
    const completenessAssignments = [
      `MIN_DESCRIPTION_LENGTH = ${MARKETPLACE_RANKING.introductionMinLength}`,
      `MAX_COUNTED_CASE_STUDIES = ${MARKETPLACE_RANKING.maxCountedCaseStudies}`,
      `POINTS_PER_CASE_STUDY = ${MARKETPLACE_RANKING.pointsPerCaseStudy}`,
      `POINTS_PER_CASE_STUDY_COVER = ${MARKETPLACE_RANKING.pointsPerCaseStudyCover}`,
      `POINTS_FOR_INTRODUCTION = ${MARKETPLACE_RANKING.pointsForIntroduction}`,
      `POINTS_FOR_SERVICE = ${MARKETPLACE_RANKING.pointsForService}`,
      `POINTS_FOR_PROFILE_PICTURE = ${MARKETPLACE_RANKING.pointsForProfilePicture}`,
      `POINTS_FOR_CALENDAR_LINK = ${MARKETPLACE_RANKING.pointsForCalendarLink}`,
      `POINTS_FOR_RATE_OR_BUDGET = ${MARKETPLACE_RANKING.pointsForRateOrBudget}`,
      `POINTS_FOR_CATEGORY = ${MARKETPLACE_RANKING.pointsForCategory}`,
    ];

    for (const assignment of completenessAssignments) {
      expect(COMPLETENESS_SOURCE).toContain(assignment);
    }

    expect(GHOST_SOURCE).toContain(
      `GHOST_INTRODUCTION_MAX_LENGTH = ${MARKETPLACE_RANKING.ghostIntroductionMaxLength}`,
    );
  });
});
