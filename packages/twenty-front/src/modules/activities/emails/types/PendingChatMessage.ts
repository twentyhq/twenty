export type PendingChatMessage = {
  id: string;
  text: string;
  files: File[];
  status: 'sending' | 'sent' | 'failed';
};
