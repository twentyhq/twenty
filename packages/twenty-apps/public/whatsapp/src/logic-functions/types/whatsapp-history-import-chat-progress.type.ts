import { type WhatsappHistoryImportChatJob } from 'src/logic-functions/types/whatsapp-history-import-chat-job.type';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

export type WhatsappHistoryImportChatProgress = {
  status: 'PENDING' | 'IMPORTING' | 'IMPORTED' | 'SKIPPED' | 'FAILED';
  chat?: UnipileChat;
  job?: WhatsappHistoryImportChatJob;
  resumeAt?: string;
  recoveryCount?: number;
  error?: WhatsappHistoryImportState['error'];
};
