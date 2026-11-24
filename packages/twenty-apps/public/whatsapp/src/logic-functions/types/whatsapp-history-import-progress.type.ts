import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

export type WhatsappHistoryImportProgress = {
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
  error?: WhatsappHistoryImportState['error'];
};
