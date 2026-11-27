import { type LinkedinHistoryImportChatJob } from 'src/logic-functions/types/linkedin-history-import-chat-job.type';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

export type LinkedinHistoryImportChatProgress = {
  status: 'IMPORTING' | 'IMPORTED' | 'SKIPPED' | 'FAILED';
  job?: LinkedinHistoryImportChatJob;
  resumeAt?: string;
  recoveryCount?: number;
  error?: LinkedinHistoryImportState['error'];
};
