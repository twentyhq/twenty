import { type CAMPAIGN_PROVIDER_OUTCOME } from 'src/engine/core-modules/emailing-domain/constants/campaign-provider-outcome.constant';

export type CampaignProviderOutcome =
  (typeof CAMPAIGN_PROVIDER_OUTCOME)[keyof typeof CAMPAIGN_PROVIDER_OUTCOME];
