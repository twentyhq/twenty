import { type AppMessageChannel } from 'twenty-sdk/logic-function';

export type WhatsAppConversation = {
  messageChannel: AppMessageChannel;
  personId: string;
  customerHandle: string;
  threadExternalId: string;
};
