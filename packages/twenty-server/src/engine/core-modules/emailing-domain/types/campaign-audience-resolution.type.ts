import { type CampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/campaign-recipient.type';

export type CampaignAudienceResolution = {
  sendableRecipients: CampaignRecipient[];
  audience: {
    totalMembers: number;
    withoutEmail: number;
    duplicateEmails: number;
    overCap: number;
    hardSuppressed: number;
    globallyUnsubscribed: number;
    topicUnsubscribed: number;
    sendable: number;
  };
};
