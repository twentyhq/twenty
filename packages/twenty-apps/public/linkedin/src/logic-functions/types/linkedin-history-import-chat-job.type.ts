import { type LinkedinImportChatContactsJobPayload } from 'src/logic-functions/types/linkedin-import-chat-contacts-job-payload.type';
import { type LinkedinImportChatMessagesJobPayload } from 'src/logic-functions/types/linkedin-import-chat-messages-job-payload.type';

export type LinkedinHistoryImportChatJob =
  | { kind: 'CONTACTS'; payload: LinkedinImportChatContactsJobPayload }
  | { kind: 'MESSAGES'; payload: LinkedinImportChatMessagesJobPayload };
