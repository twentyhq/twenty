import { type CAMPAIGN_SKIP_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-skip-reason.constant';

export type CampaignSkipReason =
  (typeof CAMPAIGN_SKIP_REASON)[keyof typeof CAMPAIGN_SKIP_REASON];
