export type GenerateCallRecordingSummaryResult = {
  outcome:
    | 'disabled'
    | 'no-transcript'
    | 'not-app-recording'
    | 'already-summarized'
    | 'not-summarizable'
    | 'empty-summary'
    | 'in-progress'
    | 'interrupted'
    | 'generated';
};
