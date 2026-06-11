// An occurrence whose event was deleted/moved; key + start re-checks siblings.
export type RemovedRecallRecordingBotOccurrence = {
  calendarEventId: string;
  realMeetingKey: string;
  startsAt: string | undefined;
};
