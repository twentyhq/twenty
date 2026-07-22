export type MessageCampaign = {
  id: string;
  subject: string | null;
  bodyTemplate: string | null;
  fromAddress: { primaryEmail: string | null } | null;
  unsubscribeTopicId: string | null;
  listId: string | null;
  status: string;
  sentAt: string | null;
  sentCount: number;
  failedCount: number;
  bouncedCount: number;
  complainedCount: number;
};
