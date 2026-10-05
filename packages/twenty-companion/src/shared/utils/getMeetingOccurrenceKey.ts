import { type Meeting } from '../types/Meeting';

export const getMeetingOccurrenceKey = (meeting: Meeting): string =>
  `${meeting.id}:${meeting.startsAt}`;
