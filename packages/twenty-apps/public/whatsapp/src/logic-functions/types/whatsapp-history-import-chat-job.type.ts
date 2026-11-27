import { type WhatsappImportChatContactsJobPayload } from 'src/logic-functions/types/whatsapp-import-chat-contacts-job-payload.type';
import { type WhatsappImportChatMessagesJobPayload } from 'src/logic-functions/types/whatsapp-import-chat-messages-job-payload.type';

export type WhatsappHistoryImportChatJob =
  | { kind: 'CONTACTS'; payload: WhatsappImportChatContactsJobPayload }
  | { kind: 'MESSAGES'; payload: WhatsappImportChatMessagesJobPayload };
