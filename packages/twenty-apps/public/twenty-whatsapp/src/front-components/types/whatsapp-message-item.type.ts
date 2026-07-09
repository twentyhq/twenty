export type WhatsappMessageItem = {
  id: string;
  text: string;
  receivedAt: string;
  direction: 'INCOMING' | 'OUTGOING';
};
