export const CalendarEventSweepKickoffOutcome = {
  SWEEP_REQUESTED: 'sweep-requested',
  SWEEP_REQUEST_FAILED: 'sweep-request-failed',
} as const;

export type CalendarEventSweepKickoffOutcome =
  (typeof CalendarEventSweepKickoffOutcome)[keyof typeof CalendarEventSweepKickoffOutcome];
