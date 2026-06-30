import { addHours } from 'date-fns';

import {
  sortCalendarEventsAsc,
  sortCalendarEventsDesc,
} from '@/activities/calendar/utils/sortCalendarEvents';

const someDate = new Date(2000, 1, 1);
const someDatePlusOneHour = addHours(someDate, 1);
const someDatePlusTwoHours = addHours(someDate, 2);
const someDatePlusThreeHours = addHours(someDate, 3);

describe('sortCalendarEventsAsc', () => {
  it('sorts non-intersecting events by ascending order', () => {
    // Given
    const eventA = {
      startsAt: someDate.toISOString(),
      endsAt: someDatePlusOneHour.toISOString(),
      isFullDay: false,
    };
    const eventB = {
      startsAt: someDatePlusTwoHours.toISOString(),
      endsAt: someDatePlusThreeHours.toISOString(),
      isFullDay: false,
    };

    // When
    const result = sortCalendarEventsAsc(eventA, eventB);
    const invertedArgsResult = sortCalendarEventsAsc(eventB, eventA);

    // Then
    expect(result).toBe(-1);
    expect(invertedArgsResult).toBe(1);
  });

  it('sorts intersecting events by start date ascending order', () => {
    // Given
    const eventA = {
      startsAt: someDate.toISOString(),
      endsAt: someDatePlusTwoHours.toISOString(),
      isFullDay: false,
    };
    const eventB = {
      startsAt: someDatePlusOneHour.toISOString(),
      endsAt: someDatePlusThreeHours.toISOString(),
      isFullDay: false,
    };

    // When
    const result = sortCalendarEventsAsc(eventA, eventB);
    const invertedArgsResult = sortCalendarEventsAsc(eventB, eventA);

    // Then
    expect(result).toBe(-1);
    expect(invertedArgsResult).toBe(1);
  });

  it('sorts events with same start date by end date ascending order', () => {
    // Given
    const eventA = {
      startsAt: someDate.toISOString(),
      endsAt: someDatePlusTwoHours.toISOString(),
      isFullDay: false,
    };
    const eventB = {
      startsAt: someDate.toISOString(),
      endsAt: someDatePlusThreeHours.toISOString(),
      isFullDay: false,
    };

    // When
    const result = sortCalendarEventsAsc(eventA, eventB);
    const invertedArgsResult = sortCalendarEventsAsc(eventB, eventA);

    // Then
    expect(result).toBe(-1);
    expect(invertedArgsResult).toBe(1);
  });

  it('sorts events with same end date by start date ascending order', () => {
    // Given
    const eventA = {
      startsAt: someDate.toISOString(),
      endsAt: someDatePlusThreeHours.toISOString(),
      isFullDay: false,
    };
    const eventB = {
      startsAt: someDatePlusOneHour.toISOString(),
      endsAt: someDatePlusThreeHours.toISOString(),
      isFullDay: false,
    };

    // When
    const result = sortCalendarEventsAsc(eventA, eventB);
    const invertedArgsResult = sortCalendarEventsAsc(eventB, eventA);

    // Then
    expect(result).toBe(-1);
    expect(invertedArgsResult).toBe(1);
  });

  it('sorts events without end date by start date ascending order', () => {
    // Given
    const eventA = {
      startsAt: someDate.toISOString(),
      isFullDay: true,
    };
    const eventB = {
      startsAt: someDatePlusOneHour.toISOString(),
      isFullDay: true,
    };

    // When
    const result = sortCalendarEventsAsc(eventA, eventB);
    const invertedArgsResult = sortCalendarEventsAsc(eventB, eventA);

    // Then
    expect(result).toBe(-1);
    expect(invertedArgsResult).toBe(1);
  });

  it('returns 0 for full day events with the same start date', () => {
    // Given
    const eventA = {
      startsAt: someDate.toISOString(),
      isFullDay: true,
    };
    const eventB = {
      startsAt: someDate.toISOString(),
      isFullDay: true,
    };

    // When
    const result = sortCalendarEventsAsc(eventA, eventB);
    const invertedArgsResult = sortCalendarEventsAsc(eventB, eventA);

    // Then
    expect(result).toBe(0);
    expect(invertedArgsResult).toBe(0);
  });

  it('sorts the full day event last for two events with the same start date if one is full day', () => {
    // Given
    const eventA = {
      startsAt: someDate.toISOString(),
      endsAt: someDatePlusOneHour.toISOString(),
      isFullDay: false,
    };
    const eventB = {
      startsAt: someDate.toISOString(),
      isFullDay: true,
    };

    // When
    const result = sortCalendarEventsAsc(eventA, eventB);
    const invertedArgsResult = sortCalendarEventsAsc(eventB, eventA);

    // Then
    expect(result).toBe(-1);
    expect(invertedArgsResult).toBe(1);
  });
});

describe('sortCalendarEventsDesc', () => {
  it('sorts non-intersecting events by descending order', () => {
    // Given
    const eventA = {
      startsAt: someDate.toISOString(),
      endsAt: someDatePlusOneHour.toISOString(),
      isFullDay: false,
    };
    const eventB = {
      startsAt: someDatePlusTwoHours.toISOString(),
      endsAt: someDatePlusThreeHours.toISOString(),
      isFullDay: false,
    };

    // When
    const result = sortCalendarEventsDesc(eventA, eventB);
    const invertedArgsResult = sortCalendarEventsDesc(eventB, eventA);

    // Then
    expect(result).toBe(1);
    expect(invertedArgsResult).toBe(-1);
  });

  it('sorts intersecting events by start date descending order', () => {
    // Given
    const eventA = {
      startsAt: someDate.toISOString(),
      endsAt: someDatePlusTwoHours.toISOString(),
      isFullDay: false,
    };
    const eventB = {
      startsAt: someDatePlusOneHour.toISOString(),
      endsAt: someDatePlusThreeHours.toISOString(),
      isFullDay: false,
    };

    // When
    const result = sortCalendarEventsDesc(eventA, eventB);
    const invertedArgsResult = sortCalendarEventsDesc(eventB, eventA);

    // Then
    expect(result).toBe(1);
    expect(invertedArgsResult).toBe(-1);
  });

  it('sorts events with same start date by end date descending order', () => {
    // Given
    const eventA = {
      startsAt: someDate.toISOString(),
      endsAt: someDatePlusTwoHours.toISOString(),
      isFullDay: false,
    };
    const eventB = {
      startsAt: someDate.toISOString(),
      endsAt: someDatePlusThreeHours.toISOString(),
      isFullDay: false,
    };

    // When
    const result = sortCalendarEventsDesc(eventA, eventB);
    const invertedArgsResult = sortCalendarEventsDesc(eventB, eventA);

    // Then
    expect(result).toBe(1);
    expect(invertedArgsResult).toBe(-1);
  });

  it('sorts events with same end date by start date descending order', () => {
    // Given
    const eventA = {
      startsAt: someDate.toISOString(),
      endsAt: someDatePlusThreeHours.toISOString(),
      isFullDay: false,
    };
    const eventB = {
      startsAt: someDatePlusOneHour.toISOString(),
      endsAt: someDatePlusThreeHours.toISOString(),
      isFullDay: false,
    };

    // When
    const result = sortCalendarEventsDesc(eventA, eventB);
    const invertedArgsResult = sortCalendarEventsDesc(eventB, eventA);

    // Then
    expect(result).toBe(1);
    expect(invertedArgsResult).toBe(-1);
  });

  it('sorts events without end date by start date descending order', () => {
    // Given
    const eventA = {
      startsAt: someDate.toISOString(),
      isFullDay: true,
    };
    const eventB = {
      startsAt: someDatePlusOneHour.toISOString(),
      isFullDay: true,
    };

    // When
    const result = sortCalendarEventsDesc(eventA, eventB);
    const invertedArgsResult = sortCalendarEventsDesc(eventB, eventA);

    // Then
    expect(result).toBe(1);
    expect(invertedArgsResult).toBe(-1);
  });

  it('returns 0 for full day events with the same start date', () => {
    // Given
    const eventA = {
      startsAt: someDate.toISOString(),
      isFullDay: true,
    };
    const eventB = {
      startsAt: someDate.toISOString(),
      isFullDay: true,
    };

    // When
    const result = sortCalendarEventsDesc(eventA, eventB);
    const invertedArgsResult = sortCalendarEventsDesc(eventB, eventA);

    // Then
    expect(result === 0).toBe(true);
    expect(invertedArgsResult === 0).toBe(true);
  });

  it('sorts the full day event first for two events with the same start date if one is full day', () => {
    // Given
    const eventA = {
      startsAt: someDate.toISOString(),
      endsAt: someDatePlusOneHour.toISOString(),
      isFullDay: false,
    };
    const eventB = {
      startsAt: someDate.toISOString(),
      isFullDay: true,
    };

    // When
    const result = sortCalendarEventsDesc(eventA, eventB);
    const invertedArgsResult = sortCalendarEventsDesc(eventB, eventA);

    // Then
    expect(result).toBe(1);
    expect(invertedArgsResult).toBe(-1);
  });
});
