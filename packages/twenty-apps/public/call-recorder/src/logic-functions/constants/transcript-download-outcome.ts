export const TranscriptDownloadOutcome = {
  FILLED: 'filled',
  FAILED: 'failed',
  PENDING: 'pending',
  ERROR: 'error',
} as const;

export type TranscriptDownloadOutcome =
  (typeof TranscriptDownloadOutcome)[keyof typeof TranscriptDownloadOutcome];
