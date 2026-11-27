import { type WhatsappCounterpart } from 'src/logic-functions/types/whatsapp-counterpart.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

export type WhatsappImportChatMessagesJobPayload = {
  connectedAccountId: string;
  runId: string;
  chat: UnipileChat;
  counterparts: WhatsappCounterpart[];
  personIdByHandle: Record<string, string>;
  pageIndex: number;
  cursor?: string;
  hasImportedMessages?: boolean;
  attempt?: number;
};
