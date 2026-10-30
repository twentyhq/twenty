import { type LinkedinImportRange } from 'src/types/linkedin-import-range.type';

export type LinkedinHistoryImportState = {
  runId: string;
  importRange: LinkedinImportRange;
  status: 'IMPORTING' | 'COMPLETED' | 'FAILED';
  importedConversationCount: number;
  startedAt: string;
  finishedAt?: string;
};
