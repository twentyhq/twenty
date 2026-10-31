import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

export type LinkedinHistoryImportProgress = {
  completedChunkCount: number;
  completedConversationCount: number;
  importedConversationCount: number;
  currentChunkProcessedCount: number;
  currentChunkImportedCount?: number;
  currentJobId?: string;
  currentResumeIndex?: number;
  currentChatCursor?: string;
  isCurrentChatImported?: boolean;
  recoveryCount?: number;
  resumeAt?: string;
  error?: LinkedinHistoryImportState['error'];
};
