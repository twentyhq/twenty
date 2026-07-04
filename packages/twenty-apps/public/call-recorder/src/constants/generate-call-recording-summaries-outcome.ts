export const GenerateCallRecordingSummariesOutcome = {
  PROCESSED: 'processed',
  DISABLED: 'disabled',
  NOTHING_SELECTED: 'nothing-selected',
  NO_CALL_RECORDINGS_FOR_CALENDAR_EVENTS:
    'no-call-recordings-for-calendar-events',
  NOTHING_TO_SUMMARIZE: 'nothing-to-summarize',
} as const;

export type GenerateCallRecordingSummariesOutcome =
  (typeof GenerateCallRecordingSummariesOutcome)[keyof typeof GenerateCallRecordingSummariesOutcome];
