import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

export type LinkedinImportChatMessagesJobPayload = {
  connectedAccountId: string;
  runId: string;
  chat: UnipileChat;
  counterparts: UnipileUser[];
  personIdByHandle: Record<string, string>;
  pageIndex: number;
  cursor?: string;
  hasImportedMessages?: boolean;
  attempt?: number;
};
