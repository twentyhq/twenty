import { assertUnreachable } from 'twenty-shared/utils';

import { CAMPAIGN_PROVIDER_OUTCOME } from 'src/engine/core-modules/emailing-domain/constants/campaign-provider-outcome.constant';
import { type CampaignDeliveryOutcomeUpdate } from 'src/engine/core-modules/emailing-domain/types/campaign-delivery-outcome-update.type';
import { type CampaignProviderOutcome } from 'src/engine/core-modules/emailing-domain/types/campaign-provider-outcome.type';

export const buildCampaignDeliveryOutcomeUpdate = ({
  outcome,
  occurredAt,
}: {
  outcome: CampaignProviderOutcome;
  occurredAt: Date;
}): CampaignDeliveryOutcomeUpdate => {
  switch (outcome) {
    case CAMPAIGN_PROVIDER_OUTCOME.DELIVERED:
      return { deliveredAt: occurredAt };
    case CAMPAIGN_PROVIDER_OUTCOME.BOUNCED:
      return { bouncedAt: occurredAt };
    case CAMPAIGN_PROVIDER_OUTCOME.COMPLAINED:
      return { complainedAt: occurredAt };
    case CAMPAIGN_PROVIDER_OUTCOME.REJECTED:
      return { rejectedAt: occurredAt };
    case CAMPAIGN_PROVIDER_OUTCOME.RENDERING_FAILED:
      return { renderingFailedAt: occurredAt };
    case CAMPAIGN_PROVIDER_OUTCOME.SOFT_BOUNCED:
      return {};
    default:
      return assertUnreachable(outcome);
  }
};
