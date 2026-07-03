export type GenerateCallRecordingSummaryResult = {
  outcome:
    | 'disabled'
    | 'no-transcript'
    | 'not-app-recording'
    | 'already-summarized'
    | 'empty-summary'
    | 'generated';
};
