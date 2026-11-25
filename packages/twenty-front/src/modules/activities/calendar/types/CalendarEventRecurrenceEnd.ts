export type CalendarEventRecurrenceEnd =
  | { type: 'NEVER' }
  | { type: 'ON_DATE'; endDate: string }
  | { type: 'AFTER_OCCURRENCE_COUNT'; occurrenceCount: number };
