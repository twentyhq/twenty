// An occurrence whose event was deleted/moved; key + start re-checks siblings.
export type RemovedMeetingBotOccurrence = {
  calendarEventId: string;
  realMeetingKey: string;
  startsAt: string | undefined;
};
