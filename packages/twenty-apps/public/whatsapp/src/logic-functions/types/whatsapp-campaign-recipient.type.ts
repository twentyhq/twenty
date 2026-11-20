export type WhatsAppCampaignRecipient = {
  messageId: string;
  recipientName: string | null;
  recipientHandle: string | null;
  sentAt: string | null;
  status: string | null;
  statusError: string | null;
  hasReplied: boolean;
};
