import { type LinkedinHistoryImportErrorCode } from 'src/types/linkedin-history-import-error-code.type';
import { type LinkedinImportPolicy } from 'src/types/linkedin-import-policy.type';

export type LinkedinHistoryImportState = {
  runId: string;
  importPolicy: LinkedinImportPolicy;
  status: 'IMPORTING' | 'COMPLETED' | 'FAILED';
  importedConversationCount: number;
  processedConversationCount: number;
  // Unipile returns it only when the provider supports it
  totalConversationCount?: number;
  startedAt: string;
  finishedAt?: string;
  error?: { code: LinkedinHistoryImportErrorCode; message: string };
};
