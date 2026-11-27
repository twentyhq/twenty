import { type LinkedinHistoryImportChatJob } from 'src/logic-functions/types/linkedin-history-import-chat-job.type';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

export type LinkedinHistoryImportChatProgress = {
  status: 'PENDING' | 'IMPORTING' | 'IMPORTED' | 'SKIPPED' | 'FAILED';
  chat?: UnipileChat;
  job?: LinkedinHistoryImportChatJob;
  resumeAt?: string;
  recoveryCount?: number;
  error?: LinkedinHistoryImportState['error'];
};
