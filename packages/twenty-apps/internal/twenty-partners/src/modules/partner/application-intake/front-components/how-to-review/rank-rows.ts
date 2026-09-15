import { MARKETPLACE_RANKING } from 'src/modules/partner/application-intake/constants/marketplace-ranking.constant';

export const RANK_ROWS: { label: string; points: string }[] = [
  {
    label: 'Approved case study',
    points: `+${MARKETPLACE_RANKING.pointsPerCaseStudy} each, max ${MARKETPLACE_RANKING.maxCountedCaseStudies}`,
  },
  {
    label: 'Cover image on a counted case study',
    points: `+${MARKETPLACE_RANKING.pointsPerCaseStudyCover} each, capped by counted case studies`,
  },
  {
    label: `Introduction, ${MARKETPLACE_RANKING.introductionMinLength}+ characters`,
    points: `+${MARKETPLACE_RANKING.pointsForIntroduction}`,
  },
  {
    label: 'At least one service',
    points: `+${MARKETPLACE_RANKING.pointsForService}`,
  },
  {
    label: 'Profile picture',
    points: `+${MARKETPLACE_RANKING.pointsForProfilePicture}`,
  },
  {
    label: 'Calendar link',
    points: `+${MARKETPLACE_RANKING.pointsForCalendarLink}`,
  },
  {
    label: 'Hourly rate or min. budget',
    points: `+${MARKETPLACE_RANKING.pointsForRateOrBudget}`,
  },
  {
    label: 'At least one category',
    points: `+${MARKETPLACE_RANKING.pointsForCategory}`,
  },
];

export const CASE_STUDY_BEATS_QUICK_FIELDS =
  MARKETPLACE_RANKING.pointsPerCaseStudy >
  MARKETPLACE_RANKING.pointsForProfilePicture +
    MARKETPLACE_RANKING.pointsForCalendarLink +
    MARKETPLACE_RANKING.pointsForRateOrBudget;
