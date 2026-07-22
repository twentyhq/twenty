type MessageCampaignStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'SENDING'
  | 'SENT'
  | 'SENT_WITH_ERRORS';

export type MessageCampaign = {
  __typename: 'MessageCampaign';
  id: string;
  subject: string | null;
  bodyTemplate: string | null;
  fromAddress: { primaryEmail: string | null } | null;
  unsubscribeTopicId: string | null;
  listId: string | null;
  status: MessageCampaignStatus;
  sentAt: string | null;
  sentCount: number;
  failedCount: number;
  bouncedCount: number;
  complainedCount: number;
};
