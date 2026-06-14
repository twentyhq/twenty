import { formatDateISOStringToCustomUnicodeFormat } from '@/localization/utils/formatDateISOStringToCustomUnicodeFormat';
import { enUS } from 'date-fns/locale';

describe('formatDateISOStringToCustomUnicodeFormat', () => {
  describe('date-only ISO strings (no time component)', () => {
    it('should render with a year-only unicode format', () => {
      const result = formatDateISOStringToCustomUnicodeFormat({
        date: '2022-01-01',
        timeZone: 'UTC',
        dateFormat: 'yyyy',
        localeCatalog: enUS,
      });

      expect(result).toBe('2022');
    });

    it('should render with a custom day-month-year unicode format', () => {
      const result = formatDateISOStringToCustomUnicodeFormat({
        date: '2022-03-14',
        timeZone: 'UTC',
        dateFormat: 'dd/MM/yyyy',
        localeCatalog: enUS,
      });

      expect(result).toBe('14/03/2022');
    });

    it('should render the same calendar date regardless of the user timezone', () => {
      const resultUtc = formatDateISOStringToCustomUnicodeFormat({
        date: '2022-01-01',
        timeZone: 'UTC',
        dateFormat: 'yyyy-MM-dd',
        localeCatalog: enUS,
      });
      const resultLA = formatDateISOStringToCustomUnicodeFormat({
        date: '2022-01-01',
        timeZone: 'America/Los_Angeles',
        dateFormat: 'yyyy-MM-dd',
        localeCatalog: enUS,
      });
      const resultTokyo = formatDateISOStringToCustomUnicodeFormat({
        date: '2022-01-01',
        timeZone: 'Asia/Tokyo',
        dateFormat: 'yyyy-MM-dd',
        localeCatalog: enUS,
      });

      expect(resultUtc).toBe('2022-01-01');
      expect(resultLA).toBe('2022-01-01');
      expect(resultTokyo).toBe('2022-01-01');
    });

    it('should preserve last day of the year in a positive offset timezone', () => {
      const result = formatDateISOStringToCustomUnicodeFormat({
        date: '2024-12-31',
        timeZone: 'Asia/Tokyo',
        dateFormat: 'yyyy-MM-dd',
        localeCatalog: enUS,
      });

      expect(result).toBe('2024-12-31');
    });
  });

  describe('datetime ISO strings', () => {
    it('should render in the user timezone for a UTC value', () => {
      const result = formatDateISOStringToCustomUnicodeFormat({
        date: '2022-01-01T12:00:00Z',
        timeZone: 'UTC',
        dateFormat: 'yyyy-MM-dd HH:mm',
        localeCatalog: enUS,
      });

      expect(result).toBe('2022-01-01 12:00');
    });

    it('should shift the displayed date backward in negative-offset timezones', () => {
      // 2022-01-01 00:00 UTC = 2021-12-31 19:00 in America/New_York (UTC-5).
      const result = formatDateISOStringToCustomUnicodeFormat({
        date: '2022-01-01T00:00:00Z',
        timeZone: 'America/New_York',
        dateFormat: 'yyyy-MM-dd HH:mm',
        localeCatalog: enUS,
      });

      expect(result).toBe('2021-12-31 19:00');
    });

    it('should shift the displayed date forward in positive-offset timezones', () => {
      // 2022-01-01 22:00 UTC = 2022-01-02 07:00 in Asia/Tokyo (UTC+9).
      const result = formatDateISOStringToCustomUnicodeFormat({
        date: '2022-01-01T22:00:00Z',
        timeZone: 'Asia/Tokyo',
        dateFormat: 'yyyy-MM-dd HH:mm',
        localeCatalog: enUS,
      });

      expect(result).toBe('2022-01-02 07:00');
    });

    it('should return the fallback string for an unknown timezone', () => {
      const result = formatDateISOStringToCustomUnicodeFormat({
        date: '2022-01-01T12:00:00Z',
        timeZone: 'Mars/Olympus',
        dateFormat: 'yyyy-MM-dd',
        localeCatalog: enUS,
      });

      expect(result).toBe('Invalid format string');
    });
  });
});
