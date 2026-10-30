import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

export type LinkedinHistoryImportProgress = {
  completedChunkCount: number;
  completedConversationCount: number;
  importedConversationCount: number;
  currentChunkProcessedCount: number;
  currentChunkImportedCount?: number;
  currentJobId?: string;
  resumeAt?: string;
  error?: LinkedinHistoryImportState['error'];
};
