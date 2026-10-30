import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

export const isLinkedinHistoryImportRunning = (
  historyImport: LinkedinHistoryImportState | null,
): boolean => historyImport?.status === 'IMPORTING';
