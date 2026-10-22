export type TeamsCallRecordingSummaryOutcome =
  | 'disabled'
  | 'not-found'
  | 'already-summarized'
  | 'no-transcript'
  | 'agent-failed'
  | 'save-failed'
  | 'not-summarizable'
  | 'summarized';
