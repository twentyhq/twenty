export const CallRecordingSummaryGenerationOutcome = {
  DISABLED: 'disabled',
  NO_TRANSCRIPT: 'no-transcript',
  NOT_APP_RECORDING: 'not-app-recording',
  ALREADY_SUMMARIZED: 'already-summarized',
  EMPTY_SUMMARY: 'empty-summary',
  GENERATED: 'generated',
} as const;

export type CallRecordingSummaryGenerationOutcome =
  (typeof CallRecordingSummaryGenerationOutcome)[keyof typeof CallRecordingSummaryGenerationOutcome];
