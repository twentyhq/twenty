import { type FakeTeamsCalendarEvent } from 'src/features/transcripts/__tests__/types/fake-teams-calendar-event.type';

export const buildHourLongOccurrence = (
  startDateTime: string,
): Pick<FakeTeamsCalendarEvent, 'startDateTime' | 'endDateTime'> => ({
  startDateTime,
  endDateTime: new Date(
    Date.parse(startDateTime) + 60 * 60 * 1_000,
  ).toISOString(),
});
