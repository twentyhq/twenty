import { type CampaignMessageRecipient } from 'src/modules/emailing/types/campaign-message-recipient.type';

export type MaterializeCampaignChunkJobData = {
  workspaceId: string;
  campaignId: string;
  messageChannelId: string;
  emailingDomainId: string;
  userWorkspaceId: string;
  // Stamped once by the planning job so every chunk shares one receivedAt,
  // the way a single looping job used to.
  receivedAtIso: string;
  // False for recipients a previous attempt already materialised: their rows
  // exist and only the send job is missing.
  shouldCreateMessages: boolean;
  recipients: CampaignMessageRecipient[];
};
