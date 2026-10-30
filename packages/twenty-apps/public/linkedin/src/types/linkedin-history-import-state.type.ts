import { type LinkedinImportPolicy } from 'src/types/linkedin-import-policy.type';

export type LinkedinHistoryImportState = {
  runId: string;
  importPolicy: LinkedinImportPolicy;
  status: 'IMPORTING' | 'COMPLETED' | 'FAILED';
  importedConversationCount: number;
  startedAt: string;
  finishedAt?: string;
};
