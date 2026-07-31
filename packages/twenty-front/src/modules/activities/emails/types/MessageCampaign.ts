export type MessageCampaignSummary = {
  id: string;
  subject: string | null;
  status: string;
  fromAddress: string | null;
  listId: string | null;
  listName: string | null;
  creatorWorkspaceMemberId: string | null;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  bouncedCount: number;
  complainedCount: number;
};

export type MessageCampaignRecipient = {
  messageId: string;
  personId: string | null;
  displayName: string;
  email: string;
  deliveryStatus: string;
  subject: string | null;
  body: string | null;
};

export type MessageCampaignDetails = MessageCampaignSummary & {
  body: string | null;
  unsubscribeTopicId: string | null;
  canEdit: boolean;
  draftPersonIds: string[];
  recipients: MessageCampaignRecipient[];
};
