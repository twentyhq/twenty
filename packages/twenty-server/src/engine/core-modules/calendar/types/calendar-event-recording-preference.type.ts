export const CALENDAR_EVENT_RECORDING_PREFERENCES = [
  'AUTO',
  'ON',
  'OFF',
] as const;

export type CalendarEventRecordingPreference =
  (typeof CALENDAR_EVENT_RECORDING_PREFERENCES)[number];
