import { type TeamsTranscriptHistoryErrorCode } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-error-code.type';

export type TeamsTranscriptHistoryState = {
  runId: string;
  windowStart: string;
  windowEnd: string;
  phase: 'importing' | 'imported' | 'failed';
  pageCount: number;
  importedCount: number;
  skippedCount: number;
  unavailableCount: number;
  updatedAt: string;
  errorCode?: TeamsTranscriptHistoryErrorCode;
};
