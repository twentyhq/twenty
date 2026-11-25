export type WhatsAppCampaignRecipient = {
  messageId: string;
  personId: string | null;
  recipientName: string | null;
  recipientHandle: string | null;
  sentAt: string | null;
  status: string | null;
  statusError: string | null;
  hasReplied: boolean;
};
