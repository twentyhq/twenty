import { DateFormat } from '@/localization/constants/DateFormat';
import { formatDateISOStringToDate } from '@/localization/utils/formatDateISOStringToDate';
import { enUS } from 'date-fns/locale';

describe('formatDateISOStringToDate', () => {
  describe('date-only ISO strings (no time component)', () => {
    it('should render the calendar date with DAY_FIRST format', () => {
      const result = formatDateISOStringToDate({
        date: '2022-01-01',
        timeZone: 'UTC',
        dateFormat: DateFormat.DAY_FIRST,
        localeCatalog: enUS,
      });

      expect(result).toBe('1 Jan, 2022');
    });

    it('should render the calendar date with MONTH_FIRST format', () => {
      const result = formatDateISOStringToDate({
        date: '2022-01-01',
        timeZone: 'UTC',
        dateFormat: DateFormat.MONTH_FIRST,
        localeCatalog: enUS,
      });

      expect(result).toBe('Jan 1, 2022');
    });

    it('should render the calendar date with YEAR_FIRST format', () => {
      const result = formatDateISOStringToDate({
        date: '2022-01-01',
        timeZone: 'UTC',
        dateFormat: DateFormat.YEAR_FIRST,
        localeCatalog: enUS,
      });

      expect(result).toBe('2022 Jan 1');
    });

    it('should render the same calendar date regardless of the user timezone', () => {
      const resultUtc = formatDateISOStringToDate({
        date: '2022-01-01',
        timeZone: 'UTC',
        dateFormat: DateFormat.DAY_FIRST,
        localeCatalog: enUS,
      });
      const resultLA = formatDateISOStringToDate({
        date: '2022-01-01',
        timeZone: 'America/Los_Angeles',
        dateFormat: DateFormat.DAY_FIRST,
        localeCatalog: enUS,
      });
      const resultTokyo = formatDateISOStringToDate({
        date: '2022-01-01',
        timeZone: 'Asia/Tokyo',
        dateFormat: DateFormat.DAY_FIRST,
        localeCatalog: enUS,
      });

      expect(resultUtc).toBe('1 Jan, 2022');
      expect(resultLA).toBe('1 Jan, 2022');
      expect(resultTokyo).toBe('1 Jan, 2022');
    });

    it('should preserve year boundaries on the last day of the year', () => {
      const result = formatDateISOStringToDate({
        date: '2024-12-31',
        timeZone: 'America/Los_Angeles',
        dateFormat: DateFormat.DAY_FIRST,
        localeCatalog: enUS,
      });

      expect(result).toBe('31 Dec, 2024');
    });

    it('should preserve year boundaries on the first day of the year', () => {
      const result = formatDateISOStringToDate({
        date: '2025-01-01',
        timeZone: 'Asia/Tokyo',
        dateFormat: DateFormat.DAY_FIRST,
        localeCatalog: enUS,
      });

      expect(result).toBe('1 Jan, 2025');
    });
  });

  describe('datetime ISO strings', () => {
    it('should render the date in UTC when timeZone is UTC', () => {
      const result = formatDateISOStringToDate({
        date: '2022-01-01T12:00:00Z',
        timeZone: 'UTC',
        dateFormat: DateFormat.DAY_FIRST,
        localeCatalog: enUS,
      });

      expect(result).toBe('1 Jan, 2022');
    });

    it('should shift the displayed day when the timezone rolls the date over', () => {
      // 2022-01-01 00:00 UTC = 2021-12-31 19:00 in America/New_York (UTC-5).
      const result = formatDateISOStringToDate({
        date: '2022-01-01T00:00:00Z',
        timeZone: 'America/New_York',
        dateFormat: DateFormat.DAY_FIRST,
        localeCatalog: enUS,
      });

      expect(result).toBe('31 Dec, 2021');
    });

    it('should shift the displayed day forward when the timezone is ahead of UTC', () => {
      // 2022-01-01 22:00 UTC = 2022-01-02 07:00 in Asia/Tokyo (UTC+9).
      const result = formatDateISOStringToDate({
        date: '2022-01-01T22:00:00Z',
        timeZone: 'Asia/Tokyo',
        dateFormat: DateFormat.DAY_FIRST,
        localeCatalog: enUS,
      });

      expect(result).toBe('2 Jan, 2022');
    });
  });
});
