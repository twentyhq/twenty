export type PendingChatMessage = {
  id: string;
  text: string;
  status: 'sending' | 'failed';
};
