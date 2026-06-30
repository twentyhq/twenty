import { formatDateISOStringToRelativeDate } from '@/localization/utils/formatDateISOStringToRelativeDate';
import { enUS, fr } from 'date-fns/locale';

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

      it('should return "Today" in Kingston when UTC has already rolled over', () => {
        // 2026-05-19 03:00 UTC = 2026-05-18 22:00 in America/Jamaica (UTC-5),
        // so today in Kingston is still May 18 even though UTC reads May 19.
        jest.setSystemTime(new Date('2026-05-19T03:00:00Z'));

        const result = formatDateISOStringToRelativeDate({
          ...baseParams,
          isoDate: '2026-05-18',
          timeZone: 'America/Jamaica',
        });

        expect(result).toBe('Today');
      });

      it('should return "Yesterday" in Kingston at the same UTC-rollover instant', () => {
        // Today in Kingston is May 18, so "2026-05-17" is yesterday there
        // even though UTC sees May 19 as today.
        jest.setSystemTime(new Date('2026-05-19T03:00:00Z'));

        const result = formatDateISOStringToRelativeDate({
          ...baseParams,
          isoDate: '2026-05-17',
          timeZone: 'America/Jamaica',
        });

        expect(result).toBe('Yesterday');
      });

      it('should return "Tomorrow" in Kingston for the date UTC already calls today', () => {
        // Today in Kingston is May 18, so "2026-05-19" is tomorrow there
        // even though UTC has already rolled over to May 19.
        jest.setSystemTime(new Date('2026-05-19T03:00:00Z'));

        const result = formatDateISOStringToRelativeDate({
          ...baseParams,
          isoDate: '2026-05-19',
          timeZone: 'America/Jamaica',
        });

        expect(result).toBe('Tomorrow');
      });

      it('should keep Kingston at UTC-5 in the summer because Jamaica does not observe DST', () => {
        // 2026-07-19 03:00 UTC = 2026-07-18 22:00 in America/Jamaica.
        // Jamaica stays on UTC-5 year-round, so today in Kingston is July 18
        // (unlike America/New_York which would be on UTC-4 EDT at this date).
        jest.setSystemTime(new Date('2026-07-19T03:00:00Z'));

        const result = formatDateISOStringToRelativeDate({
          ...baseParams,
          isoDate: '2026-07-18',
          timeZone: 'America/Jamaica',
        });

        expect(result).toBe('Today');
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

      it('should return month-level rounding for far-past dates', () => {
        const result = formatDateISOStringToRelativeDate({
          ...baseParams,
          isoDate: '2026-04-18',
          timeZone: 'UTC',
        });

        expect(result).toBe('about 1 month ago');
      });
    });

    describe('with a non-English locale catalog', () => {
      beforeEach(() => {
        jest.setSystemTime(new Date('2026-05-18T13:00:00Z'));
      });

      it('should localize the distance output via formatDistance', () => {
        const result = formatDateISOStringToRelativeDate({
          ...baseParams,
          localeCatalog: fr,
          isoDate: '2026-05-25',
          timeZone: 'UTC',
        });

        expect(result).toBe('dans 7 jours');
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

    it('should not short-circuit to "Yesterday" and should return a day-based distance instead', () => {
      const result = formatDateISOStringToRelativeDate({
        isoDate: '2026-05-17',
        localeCatalog: enUS,
        timeZone: 'UTC',
      });

      expect(result).toBe('1 day ago');
    });

    it('should not short-circuit to "Tomorrow" and should return a day-based distance instead', () => {
      const result = formatDateISOStringToRelativeDate({
        isoDate: '2026-05-19',
        localeCatalog: enUS,
        timeZone: 'UTC',
      });

      expect(result).toBe('in 1 day');
    });

    it('should anchor the diff in the user timezone near midnight boundaries', () => {
      // 2026-05-18 21:00 UTC = 2026-05-19 06:00 in Asia/Tokyo,
      // so today in Tokyo is May 19 and the diff against "2026-05-19" is zero.
      jest.setSystemTime(new Date('2026-05-18T21:00:00Z'));

      const result = formatDateISOStringToRelativeDate({
        isoDate: '2026-05-19',
        localeCatalog: enUS,
        timeZone: 'Asia/Tokyo',
      });

      expect(result).toBe('less than a minute ago');
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

    it('should bucket sub-day distances to a day-level when isDayMaximumPrecision is true', () => {
      // Same calendar day, three hours apart: startOfDay collapses both
      // anchors to the same instant so the formatted distance is zero.
      const result = formatDateISOStringToRelativeDate({
        isoDate: '2026-05-18T10:00:00Z',
        isDayMaximumPrecision: true,
        localeCatalog: enUS,
        timeZone: 'UTC',
      });

      expect(result).toBe('less than a minute ago');
    });

    it('should return forward-looking sub-day precision for future datetimes within 24h', () => {
      const result = formatDateISOStringToRelativeDate({
        isoDate: '2026-05-18T16:00:00Z',
        localeCatalog: enUS,
        timeZone: 'UTC',
      });

      expect(result).toBe('in about 3 hours');
    });

    it('should switch to day buckets at the 24h boundary even without isDayMaximumPrecision', () => {
      // Exactly 24h ahead: isWithin24h becomes false and the startOfDay
      // branch takes over, producing a whole-day distance.
      const result = formatDateISOStringToRelativeDate({
        isoDate: '2026-05-19T13:00:00Z',
        localeCatalog: enUS,
        timeZone: 'UTC',
      });

      expect(result).toBe('in 1 day');
    });

    it('should bucket to whole days for distances beyond 24h without isDayMaximumPrecision', () => {
      const result = formatDateISOStringToRelativeDate({
        isoDate: '2026-05-21T20:00:00Z',
        localeCatalog: enUS,
        timeZone: 'UTC',
      });

      expect(result).toBe('in 3 days');
    });

    it('should parse datetime ISO strings with an explicit non-UTC offset', () => {
      // 15:00 +09:00 = 06:00 UTC, roughly 7 hours before the fake "now".
      const result = formatDateISOStringToRelativeDate({
        isoDate: '2026-05-18T15:00:00+09:00',
        localeCatalog: enUS,
        timeZone: 'UTC',
      });

      expect(result).toBe('about 7 hours ago');
    });
  });
});
