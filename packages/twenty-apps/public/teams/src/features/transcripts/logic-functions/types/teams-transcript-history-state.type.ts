import { type TeamsTranscriptHistoryErrorCode } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-error-code.type';
import { type TeamsTranscriptHistoryRunningPhase } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-running-phase.type';
import { type TeamsTranscriptHistoryJobPayload } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-job-payload.type';

export type TeamsTranscriptHistoryState = {
  runId: string;
  days: number;
  windowStart: string;
  windowEnd: string;
  phase: TeamsTranscriptHistoryRunningPhase | 'counted' | 'imported' | 'failed';
  transcriptCount: number;
  alreadyImportedCount: number;
  deletedCount: number;
  pageCount: number;
  importedCount: number;
  skippedCount: number;
  unavailableCount: number;
  checkedThrough?: string;
  updatedAt: string;
  errorCode?: TeamsTranscriptHistoryErrorCode;
  nextJob?: TeamsTranscriptHistoryJobPayload;
};
