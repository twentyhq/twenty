import { addDays, addHours, startOfDay, subDays, subHours } from 'date-fns';

import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';

import { findUpcomingCalendarEvent } from '../findUpcomingCalendarEvent';

const pastEvent: Pick<CalendarEvent, 'startsAt' | 'endsAt' | 'isFullDay'> = {
  startsAt: subHours(new Date(), 2).toISOString(),
  endsAt: subHours(new Date(), 1).toISOString(),
  isFullDay: false,
};
const fullDayPastEvent: Pick<CalendarEvent, 'startsAt' | 'isFullDay'> = {
  startsAt: subDays(new Date(), 1).toISOString(),
  isFullDay: true,
};

const currentEvent: Pick<CalendarEvent, 'startsAt' | 'endsAt' | 'isFullDay'> = {
  startsAt: addHours(new Date(), 1).toISOString(),
  endsAt: addHours(new Date(), 2).toISOString(),
  isFullDay: false,
};
const currentFullDayEvent: Pick<CalendarEvent, 'startsAt' | 'isFullDay'> = {
  startsAt: startOfDay(new Date()).toISOString(),
  isFullDay: true,
};

const futureEvent: Pick<CalendarEvent, 'startsAt' | 'endsAt' | 'isFullDay'> = {
  startsAt: addDays(new Date(), 1).toISOString(),
  endsAt: addDays(new Date(), 2).toISOString(),
  isFullDay: false,
};
const fullDayFutureEvent: Pick<CalendarEvent, 'startsAt' | 'isFullDay'> = {
  startsAt: addDays(new Date(), 2).toISOString(),
  isFullDay: false,
};

describe('findUpcomingCalendarEvent', () => {
  it('returns the first current event by chronological order', () => {
    // Given
    const calendarEvents = [
      futureEvent,
      currentFullDayEvent,
      pastEvent,
      currentEvent,
    ];

    // When
    const result = findUpcomingCalendarEvent(calendarEvents);

    // Then
    expect(result).toEqual(currentFullDayEvent);
  });

  it('returns the next future event by chronological order', () => {
    // Given
    const calendarEvents = [
      fullDayPastEvent,
      fullDayFutureEvent,
      futureEvent,
      pastEvent,
    ];

    // When
    const result = findUpcomingCalendarEvent(calendarEvents);

    // Then
    expect(result).toEqual(futureEvent);
  });

  it('returns undefined if all events are in the past', () => {
    // Given
    const calendarEvents = [pastEvent, fullDayPastEvent];

    // When
    const result = findUpcomingCalendarEvent(calendarEvents);

    // Then
    expect(result).toBeUndefined();
  });
});
