import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

export type WhatsappHistoryImportPlanning = {
  plannedChunkCount: number;
  plannedConversationCount: number;
  reportedConversationCount?: number;
  chunkCount?: number;
  planJobId?: string;
  resumeAt?: string;
  error?: WhatsappHistoryImportState['error'];
};
