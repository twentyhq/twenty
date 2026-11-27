import { type WhatsappHistoryImportErrorCode } from 'src/types/whatsapp-history-import-error-code.type';
import { type WhatsappImportPolicy } from 'src/types/whatsapp-import-policy.type';

export type WhatsappHistoryImportState = {
  runId: string;
  importPolicy: WhatsappImportPolicy;
  conversationLimit: number;
  status: 'IMPORTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  importedConversationCount: number;
  processedConversationCount: number;
  totalConversationCount?: number;
  chunkCount?: number;
  plannedChunkCount?: number;
  plannedConversationCount?: number;
  startedAt: string;
  resumeAt?: string;
  finishedAt?: string;
  error?: { code: WhatsappHistoryImportErrorCode; message: string };
};
