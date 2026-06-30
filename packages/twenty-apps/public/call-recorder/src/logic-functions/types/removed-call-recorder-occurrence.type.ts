// An occurrence whose event was deleted/moved; key + start re-checks siblings.
export type RemovedCallRecorderOccurrence = {
  calendarEventId: string;
  realMeetingKey: string;
  startsAt: string | undefined;
};
