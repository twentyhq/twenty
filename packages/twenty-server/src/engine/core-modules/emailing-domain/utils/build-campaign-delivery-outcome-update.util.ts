import { assertUnreachable } from 'twenty-shared/utils';

import { type CampaignDeliveryWorkspaceEntity } from 'src/modules/emailing/standard-objects/campaign-delivery.workspace-entity';
import { CAMPAIGN_PROVIDER_OUTCOME } from 'src/engine/core-modules/emailing-domain/constants/campaign-provider-outcome.constant';
import { type CampaignProviderOutcome } from 'src/engine/core-modules/emailing-domain/types/campaign-provider-outcome.type';

type CampaignDeliveryOutcomeUpdate = Partial<
  Pick<
    CampaignDeliveryWorkspaceEntity,
    | 'deliveredAt'
    | 'bouncedAt'
    | 'complainedAt'
    | 'rejectedAt'
    | 'renderingFailedAt'
  >
>;

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
