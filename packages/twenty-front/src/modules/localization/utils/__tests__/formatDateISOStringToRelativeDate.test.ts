import { enUS } from 'date-fns/locale';

import { formatDateISOStringToRelativeDate } from '@/localization/utils/formatDateISOStringToRelativeDate';

const localeCatalog = enUS;

const toDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

describe('formatDateISOStringToRelativeDate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('date-only ISO strings (YYYY-MM-DD)', () => {
    it('should return "Today" for today\'s date', () => {
      const now = new Date('2026-04-14T15:00:00');
      jest.setSystemTime(now);

      const result = formatDateISOStringToRelativeDate({
        isoDate: toDateOnly(now),
        isDayMaximumPrecision: true,
        localeCatalog,
      });

      expect(result).toBe('Today');
    });

    it('should return "Yesterday" for yesterday\'s date', () => {
      const now = new Date('2026-04-14T15:00:00');
      jest.setSystemTime(now);
      const yesterday = new Date('2026-04-13T15:00:00');

      const result = formatDateISOStringToRelativeDate({
        isoDate: toDateOnly(yesterday),
        isDayMaximumPrecision: true,
        localeCatalog,
      });

      expect(result).toBe('Yesterday');
    });

    it('should return "Tomorrow" for tomorrow\'s date', () => {
      const now = new Date('2026-04-14T15:00:00');
      jest.setSystemTime(now);
      const tomorrow = new Date('2026-04-15T15:00:00');

      const result = formatDateISOStringToRelativeDate({
        isoDate: toDateOnly(tomorrow),
        isDayMaximumPrecision: true,
        localeCatalog,
      });

      expect(result).toBe('Tomorrow');
    });

    it('should not shift the calendar day when isoDate is date-only', () => {
      // Regression: new Date("2026-04-14") is UTC midnight, which in UTC-N timezones
      // equals the evening of April 13. The fix appends T00:00:00 to force local parsing.
      const now = new Date('2026-04-14T00:30:00'); // 30 min into Apr 14 locally
      jest.setSystemTime(now);

      const result = formatDateISOStringToRelativeDate({
        isoDate: '2026-04-14',
        isDayMaximumPrecision: true,
        localeCatalog,
      });

      expect(result).toBe('Today');
    });
  });

  describe('datetime ISO strings', () => {
    it('should return relative time for full datetime strings', () => {
      const now = new Date('2026-04-14T12:00:00Z');
      jest.setSystemTime(now);

      const result = formatDateISOStringToRelativeDate({
        isoDate: '2026-04-14T11:00:00Z',
        isDayMaximumPrecision: false,
        localeCatalog,
      });

      expect(result).toBe('about 1 hour ago');
    });

    it('should return day-level label for full datetime when isDayMaximumPrecision is true', () => {
      const now = new Date('2026-04-14T12:00:00Z');
      jest.setSystemTime(now);

      const result = formatDateISOStringToRelativeDate({
        isoDate: '2026-04-14T06:00:00Z',
        isDayMaximumPrecision: true,
        localeCatalog,
      });

      expect(result).toBe('Today');
    });
  });
});
