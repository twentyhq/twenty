import { addDays, addHours, subDays, subHours } from 'date-fns';

import { hasCalendarEventEnded } from '@/activities/calendar/utils/hasCalendarEventEnded';

describe('hasCalendarEventEnded', () => {
  describe('Event with end date', () => {
    it('returns true for an event with a past end date', () => {
      const startsAt = subHours(new Date(), 2).toISOString();
      const endsAt = subHours(new Date(), 1).toISOString();
      const isFullDay = false;

      const result = hasCalendarEventEnded({
        startsAt,
        endsAt,
        isFullDay,
      });

      expect(result).toBe(true);
    });

    it('returns false for an event with a future end date', () => {
      const startsAt = new Date().toISOString();
      const endsAt = addHours(new Date(), 1).toISOString();
      const isFullDay = false;

      const result = hasCalendarEventEnded({
        startsAt,
        endsAt,
        isFullDay,
      });

      expect(result).toBe(false);
    });
  });

  describe('Full day event', () => {
    it('returns true for a past full day event', () => {
      const startsAt = subDays(new Date(), 1).toISOString();
      const isFullDay = true;

      const result = hasCalendarEventEnded({
        startsAt,
        isFullDay,
      });

      expect(result).toBe(true);
    });

    it('returns false for a future full day event', () => {
      const startsAt = addDays(new Date(), 1).toISOString();
      const isFullDay = true;

      const result = hasCalendarEventEnded({
        startsAt,
        isFullDay,
      });

      expect(result).toBe(false);
    });

    it('returns false if the full day event is today', () => {
      const startsAt = new Date().toISOString();
      const isFullDay = true;

      const result = hasCalendarEventEnded({
        startsAt,
        isFullDay,
      });

      expect(result).toBe(false);
    });
  });
});
