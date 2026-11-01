export type TeamsTranscriptImportOutcome =
  | 'imported'
  | 'skipped-deleted'
  | 'retry-scheduled'
  | 'retries-exhausted'
  | 'failed';
