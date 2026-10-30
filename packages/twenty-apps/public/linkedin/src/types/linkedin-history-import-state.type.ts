import { type LinkedinHistoryImportErrorCode } from 'src/types/linkedin-history-import-error-code.type';
import { type LinkedinImportPolicy } from 'src/types/linkedin-import-policy.type';

export type LinkedinHistoryImportState = {
  runId: string;
  importPolicy: LinkedinImportPolicy;
  status: 'IMPORTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  importedConversationCount: number;
  processedConversationCount: number;
  totalConversationCount?: number;
  chunkCount?: number;
  planJobId?: string;
  startedAt: string;
  finishedAt?: string;
  error?: { code: LinkedinHistoryImportErrorCode; message: string };
};
