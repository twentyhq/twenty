export type MessengerConversationMessage = {
  sentAt: string | null;
  direction: 'INCOMING' | 'OUTGOING';
  text: string;
  status: string | null;
};

export type MessengerConversationThread = {
  connectedAccountId: string;
  messageChannelId: string;
  pageHandle: string;
  threadExternalId: string;
};

export type MessengerConversation = {
  messages: MessengerConversationMessage[];
  latestThread: MessengerConversationThread | undefined;
};
