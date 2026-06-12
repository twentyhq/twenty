import { type CampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/campaign-recipient.type';

// Fan-out job payload: carries only recipient refs (personId + validated email),
// never the campaign body. The job materializes one message per recipient and
// fans out a per-recipient send job each.
export type MaterializeCampaignJobData = {
  workspaceId: string;
  campaignId: string;
  messageChannelId: string;
  emailingDomainId: string;
  recipients: CampaignRecipient[];
};
