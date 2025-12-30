import { addHours, subHours } from 'date-fns';

import { hasCalendarEventStarted } from '@/activities/calendar/utils/hasCalendarEventStarted';

describe('hasCalendarEventStarted', () => {
  it('returns true for an event with a past start date', () => {
    // Given
    const startsAt = subHours(new Date(), 2).toISOString();

    // When
    const result = hasCalendarEventStarted({ startsAt });

    // Then
    expect(result).toBe(true);
  });

  it('returns false for an event with a future start date', () => {
    // Given
    const startsAt = addHours(new Date(), 1).toISOString();

    // When
    const result = hasCalendarEventStarted({ startsAt });

    // Then
    expect(result).toBe(false);
  });
});
