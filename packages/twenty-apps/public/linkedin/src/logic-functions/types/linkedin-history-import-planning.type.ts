import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

export type LinkedinHistoryImportPlanning = {
  chatIds?: string[];
  planJobId?: string;
  resumeAt?: string;
  error?: LinkedinHistoryImportState['error'];
};
