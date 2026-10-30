import { LINKEDIN_HISTORY_IMPORT_STALL_THRESHOLD_MILLISECONDS } from 'src/constants/linkedin-history-import-stall-threshold-milliseconds.constant';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

export const isLinkedinHistoryImportStalled = ({
  historyImport,
  now,
}: {
  historyImport: LinkedinHistoryImportState | null;
  now: number;
}): boolean =>
  historyImport?.status === 'IMPORTING' &&
  now - Date.parse(historyImport.updatedAt ?? historyImport.startedAt) >
    LINKEDIN_HISTORY_IMPORT_STALL_THRESHOLD_MILLISECONDS;

export const isLinkedinHistoryImportRunning = ({
  historyImport,
  now,
}: {
  historyImport: LinkedinHistoryImportState | null;
  now: number;
}): boolean =>
  historyImport?.status === 'IMPORTING' &&
  !isLinkedinHistoryImportStalled({ historyImport, now });
