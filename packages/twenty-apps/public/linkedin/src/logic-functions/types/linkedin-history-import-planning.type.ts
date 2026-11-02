import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

export type LinkedinHistoryImportPlanning = {
  plannedChunkCount: number;
  plannedConversationCount: number;
  reportedConversationCount?: number;
  chunkCount?: number;
  planJobId?: string;
  resumeAt?: string;
  error?: LinkedinHistoryImportState['error'];
};
