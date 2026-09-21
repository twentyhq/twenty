import { type CAMPAIGN_FAILURE_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-failure-reason.constant';

export type CampaignFailureReason =
  (typeof CAMPAIGN_FAILURE_REASON)[keyof typeof CAMPAIGN_FAILURE_REASON];
