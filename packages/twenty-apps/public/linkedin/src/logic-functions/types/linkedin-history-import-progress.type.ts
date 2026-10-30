import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

export type LinkedinHistoryImportProgress = {
  completedChunkCount: number;
  completedConversationCount: number;
  importedConversationCount: number;
  currentChunkProcessedCount: number;
  error?: LinkedinHistoryImportState['error'];
};
