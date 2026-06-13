import { type CampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/campaign-recipient.type';

export type MaterializeCampaignJobData = {
  workspaceId: string;
  campaignId: string;
  messageChannelId: string;
  emailingDomainId: string;
  recipients: CampaignRecipient[];
};
