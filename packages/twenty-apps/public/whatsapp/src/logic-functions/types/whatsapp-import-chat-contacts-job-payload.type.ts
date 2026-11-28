import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

export type WhatsappImportChatContactsJobPayload = {
  connectedAccountId: string;
  runId: string;
  chat: UnipileChat;
  attempt?: number;
};
