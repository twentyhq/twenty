// A real meeting occurrence whose source calendar event was deleted or moved.
// The key plus start lets reconciliation re-check surviving duplicate events.
export type RemovedRecallRecordingBotOccurrence = {
  calendarEventId: string;
  realMeetingKey: string;
  startsAt: string | null;
};
