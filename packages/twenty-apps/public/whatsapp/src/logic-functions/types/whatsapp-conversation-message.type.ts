export type WhatsAppConversationMessage = {
  sentAt: string | null;
  direction: 'INCOMING' | 'OUTGOING';
  text: string;
  status: string | null;
};
