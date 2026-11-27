import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

export type LinkedinImportChatContactsJobPayload = {
  connectedAccountId: string;
  runId: string;
  chat: UnipileChat;
  attempt?: number;
};
