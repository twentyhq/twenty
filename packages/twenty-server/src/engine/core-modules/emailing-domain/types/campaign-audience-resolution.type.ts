import { type CampaignAudience } from 'src/engine/core-modules/emailing-domain/types/campaign-audience.type';
import { type CampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/campaign-recipient.type';

export type CampaignAudienceResolution = {
  sendableRecipients: CampaignRecipient[];
  audience: CampaignAudience;
};
