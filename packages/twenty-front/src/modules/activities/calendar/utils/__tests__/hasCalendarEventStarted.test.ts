import { addHours, subHours } from 'date-fns';

import { hasCalendarEventStarted } from '@/activities/calendar/utils/hasCalendarEventStarted';

describe('hasCalendarEventStarted', () => {
  it('returns true for an event with a past start date', () => {
    const startsAt = subHours(new Date(), 2).toISOString();

    const result = hasCalendarEventStarted({ startsAt });

    expect(result).toBe(true);
  });

  it('returns false for an event with a future start date', () => {
    const startsAt = addHours(new Date(), 1).toISOString();

    const result = hasCalendarEventStarted({ startsAt });

    expect(result).toBe(false);
  });
});
