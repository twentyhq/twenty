import { type TeamsTranscriptHistoryErrorCode } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-error-code.type';

export type TeamsTranscriptHistoryPageResult =
  | { success: true; transcriptCount: number; isRunComplete: boolean }
  | { success: true; skipped: true; reason: string }
  | { success: true; retryScheduled: true }
  | { success: false; errorCode: TeamsTranscriptHistoryErrorCode }
  | { success: false; error: string };
