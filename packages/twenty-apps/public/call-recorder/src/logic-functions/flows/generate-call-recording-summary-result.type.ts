export type GenerateCallRecordingSummaryResult = {
  outcome:
    | 'disabled'
    | 'no-transcript'
    | 'already-summarized'
    | 'not-claimed'
    | 'empty-summary'
    | 'generated';
};
