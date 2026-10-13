export type TeamsTranscriptHistoryPageResult =
  | { success: true }
  | { success: true; skipped: true; reason: string }
  | { success: true; retryScheduled: true }
  | { success: false; error: string };
