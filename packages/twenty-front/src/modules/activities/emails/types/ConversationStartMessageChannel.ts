import { type ConnectedAccountProvider } from 'twenty-shared/types';

export type ConversationStartMessageChannel = {
  messageChannelId: string;
  label: string;
  provider: ConnectedAccountProvider;
  applicationId: string | null;
};
