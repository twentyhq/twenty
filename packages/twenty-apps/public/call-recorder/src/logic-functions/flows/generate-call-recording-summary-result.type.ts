export type GenerateCallRecordingSummaryResult = {
  outcome:
    | 'disabled'
    | 'no-transcript'
    | 'already-summarized'
    | 'empty-summary'
    | 'generated';
};
