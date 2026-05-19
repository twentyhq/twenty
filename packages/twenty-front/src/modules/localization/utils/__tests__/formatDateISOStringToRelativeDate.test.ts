import { formatDateISOStringToRelativeDate } from '@/localization/utils/formatDateISOStringToRelativeDate';
import { enUS } from 'date-fns/locale';

describe('formatDateISOStringToRelativeDate', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('date-only ISO strings with day-maximum precision', () => {
    const baseParams = {
      isDayMaximumPrecision: true,
      localeCatalog: enUS,
    };

    describe('when the user is in UTC and the current instant is mid-day UTC', () => {
      beforeEach(() => {
        jest.setSystemTime(new Date('2026-05-18T13:00:00Z'));
      });

      it('should return "Today" for the current calendar date in UTC', () => {
        const result = formatDateISOStringToRelativeDate({
          ...baseParams,
          isoDate: '2026-05-18',
          timeZone: 'UTC',
        });

        expect(result).toBe('Today');
      });

      it('should return "Yesterday" for the previous calendar date in UTC', () => {
        const result = formatDateISOStringToRelativeDate({
          ...baseParams,
          isoDate: '2026-05-17',
          timeZone: 'UTC',
        });

        expect(result).toBe('Yesterday');
      });

      it('should return "Tomorrow" for the next calendar date in UTC', () => {
        const result = formatDateISOStringToRelativeDate({
          ...baseParams,
          isoDate: '2026-05-19',
          timeZone: 'UTC',
        });

        expect(result).toBe('Tomorrow');
      });
    });

    describe('when the user timezone differs from UTC', () => {
      it('should return "Today" when the current calendar date in Tokyo has already rolled over', () => {
        // 2026-05-18 21:00 UTC = 2026-05-19 06:00 in Asia/Tokyo (UTC+9),
        // so today in Tokyo is May 19.
        jest.setSystemTime(new Date('2026-05-18T21:00:00Z'));

        const result = formatDateISOStringToRelativeDate({
          ...baseParams,
          isoDate: '2026-05-19',
          timeZone: 'Asia/Tokyo',
        });

        expect(result).toBe('Today');
      });

      it('should return "Tomorrow" for the same value when the user is in UTC', () => {
        jest.setSystemTime(new Date('2026-05-18T21:00:00Z'));

        const result = formatDateISOStringToRelativeDate({
          ...baseParams,
          isoDate: '2026-05-19',
          timeZone: 'UTC',
        });

        expect(result).toBe('Tomorrow');
      });

      it('should return "Yesterday" in Los Angeles when UTC has already rolled over', () => {
        // 2026-05-19 02:00 UTC = 2026-05-18 19:00 in America/Los_Angeles (UTC-7),
        // so today in LA is still May 18 and "2026-05-17" is yesterday there.
        jest.setSystemTime(new Date('2026-05-19T02:00:00Z'));

        const result = formatDateISOStringToRelativeDate({
          ...baseParams,
          isoDate: '2026-05-17',
          timeZone: 'America/Los_Angeles',
        });

        expect(result).toBe('Yesterday');
      });

      it('should return "Today" for the same value in UTC at the same instant', () => {
        // At 2026-05-19 02:00 UTC, today in UTC is already May 19,
        // so "2026-05-17" is two days ago in UTC.
        jest.setSystemTime(new Date('2026-05-19T02:00:00Z'));

        const result = formatDateISOStringToRelativeDate({
          ...baseParams,
          isoDate: '2026-05-17',
          timeZone: 'UTC',
        });

        expect(result).toBe('2 days ago');
      });
    });

    describe('for distances beyond plus or minus one day', () => {
      beforeEach(() => {
        jest.setSystemTime(new Date('2026-05-18T13:00:00Z'));
      });

      it('should return a forward-looking distance for future dates', () => {
        const result = formatDateISOStringToRelativeDate({
          ...baseParams,
          isoDate: '2026-05-25',
          timeZone: 'UTC',
        });

        expect(result).toBe('in 7 days');
      });

      it('should return a past-looking distance for past dates', () => {
        const result = formatDateISOStringToRelativeDate({
          ...baseParams,
          isoDate: '2026-05-13',
          timeZone: 'UTC',
        });

        expect(result).toBe('5 days ago');
      });

      it('should return month-level rounding for far-future dates', () => {
        const result = formatDateISOStringToRelativeDate({
          ...baseParams,
          isoDate: '2026-06-18',
          timeZone: 'UTC',
        });

        expect(result).toBe('in about 1 month');
      });
    });
  });

  describe('date-only ISO strings without day-maximum precision', () => {
    beforeEach(() => {
      jest.setSystemTime(new Date('2026-05-18T13:00:00Z'));
    });

    it('should not short-circuit to "Today" and should return a distance instead', () => {
      const result = formatDateISOStringToRelativeDate({
        isoDate: '2026-05-18',
        localeCatalog: enUS,
        timeZone: 'UTC',
      });

      expect(result).toBe('less than a minute ago');
    });

    it('should still respect the user timezone when computing the distance', () => {
      const result = formatDateISOStringToRelativeDate({
        isoDate: '2026-05-25',
        localeCatalog: enUS,
        timeZone: 'UTC',
      });

      expect(result).toBe('in 7 days');
    });
  });

  describe('datetime ISO strings', () => {
    beforeEach(() => {
      jest.setSystemTime(new Date('2026-05-18T13:00:00Z'));
    });

    it('should return a past distance for a datetime in the past', () => {
      const result = formatDateISOStringToRelativeDate({
        isoDate: '2026-05-16T13:00:00Z',
        isDayMaximumPrecision: true,
        localeCatalog: enUS,
        timeZone: 'UTC',
      });

      expect(result).toBe('2 days ago');
    });

    it('should return a future distance for a datetime in the future', () => {
      const result = formatDateISOStringToRelativeDate({
        isoDate: '2026-05-21T13:00:00Z',
        isDayMaximumPrecision: true,
        localeCatalog: enUS,
        timeZone: 'UTC',
      });

      expect(result).toBe('in 3 days');
    });

    it('should return sub-day precision when within 24h and isDayMaximumPrecision is false', () => {
      const result = formatDateISOStringToRelativeDate({
        isoDate: '2026-05-18T10:00:00Z',
        localeCatalog: enUS,
        timeZone: 'UTC',
      });

      expect(result).toBe('about 3 hours ago');
    });
  });
});
