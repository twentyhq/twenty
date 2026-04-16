import { formatDateISOStringToRelativeDate } from '@/localization/utils/formatDateISOStringToRelativeDate';
import defaultLocale from 'date-fns/locale/en-US';

describe('formatDateISOStringToRelativeDate', () => {
  const localeCatalog = defaultLocale;
  const originalTZ = process.env.TZ;

  afterEach(() => {
    // Restore original timezone
    process.env.TZ = originalTZ;
  });

  describe('DATE field handling for users west of UTC', () => {
    it('should display "Tomorrow" for tomorrow DATE field in UTC-5 timezone', () => {
      // Set timezone to EST (UTC-5)
      process.env.TZ = 'America/New_York';

      // Get tomorrow's date as a date-only ISO string (YYYY-MM-DD)
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDateString = tomorrow.toISOString().split('T')[0];

      const result = formatDateISOStringToRelativeDate({
        isoDate: tomorrowDateString,
        isDayMaximumPrecision: true,
        localeCatalog,
      });

      expect(result).toBe('Tomorrow');
    });

    it('should display "Tomorrow" for tomorrow DATE field in UTC-8 timezone', () => {
      // Set timezone to PST (UTC-8)
      process.env.TZ = 'America/Los_Angeles';

      // Get tomorrow's date as a date-only ISO string (YYYY-MM-DD)
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDateString = tomorrow.toISOString().split('T')[0];

      const result = formatDateISOStringToRelativeDate({
        isoDate: tomorrowDateString,
        isDayMaximumPrecision: true,
        localeCatalog,
      });

      expect(result).toBe('Tomorrow');
    });

    it('should display "Yesterday" for yesterday DATE field in UTC-5 timezone', () => {
      // Set timezone to EST (UTC-5)
      process.env.TZ = 'America/New_York';

      // Get yesterday's date as a date-only ISO string (YYYY-MM-DD)
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDateString = yesterday.toISOString().split('T')[0];

      const result = formatDateISOStringToRelativeDate({
        isoDate: yesterdayDateString,
        isDayMaximumPrecision: true,
        localeCatalog,
      });

      expect(result).toBe('Yesterday');
    });

    it('should display "Yesterday" for yesterday DATE field in UTC-8 timezone', () => {
      // Set timezone to PST (UTC-8)
      process.env.TZ = 'America/Los_Angeles';

      // Get yesterday's date as a date-only ISO string (YYYY-MM-DD)
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDateString = yesterday.toISOString().split('T')[0];

      const result = formatDateISOStringToRelativeDate({
        isoDate: yesterdayDateString,
        isDayMaximumPrecision: true,
        localeCatalog,
      });

      expect(result).toBe('Yesterday');
    });
  });

  describe('No regression for users in UTC or east of UTC', () => {
    it('should display "Tomorrow" for tomorrow DATE field in UTC timezone', () => {
      // Set timezone to UTC
      process.env.TZ = 'UTC';

      // Get tomorrow's date as a date-only ISO string (YYYY-MM-DD)
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDateString = tomorrow.toISOString().split('T')[0];

      const result = formatDateISOStringToRelativeDate({
        isoDate: tomorrowDateString,
        isDayMaximumPrecision: true,
        localeCatalog,
      });

      expect(result).toBe('Tomorrow');
    });

    it('should display "Yesterday" for yesterday DATE field in UTC timezone', () => {
      // Set timezone to UTC
      process.env.TZ = 'UTC';

      // Get yesterday's date as a date-only ISO string (YYYY-MM-DD)
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDateString = yesterday.toISOString().split('T')[0];

      const result = formatDateISOStringToRelativeDate({
        isoDate: yesterdayDateString,
        isDayMaximumPrecision: true,
        localeCatalog,
      });

      expect(result).toBe('Yesterday');
    });

    it('should display "Tomorrow" for tomorrow DATE field in UTC+1 timezone', () => {
      // Set timezone to CET (UTC+1)
      process.env.TZ = 'Europe/Paris';

      // Get tomorrow's date as a date-only ISO string (YYYY-MM-DD)
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDateString = tomorrow.toISOString().split('T')[0];

      const result = formatDateISOStringToRelativeDate({
        isoDate: tomorrowDateString,
        isDayMaximumPrecision: true,
        localeCatalog,
      });

      expect(result).toBe('Tomorrow');
    });

    it('should display "Yesterday" for yesterday DATE field in UTC+1 timezone', () => {
      // Set timezone to CET (UTC+1)
      process.env.TZ = 'Europe/Paris';

      // Get yesterday's date as a date-only ISO string (YYYY-MM-DD)
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDateString = yesterday.toISOString().split('T')[0];

      const result = formatDateISOStringToRelativeDate({
        isoDate: yesterdayDateString,
        isDayMaximumPrecision: true,
        localeCatalog,
      });

      expect(result).toBe('Yesterday');
    });

    it('should display "Tomorrow" for tomorrow DATE field in UTC+8 timezone', () => {
      // Set timezone to HKT (UTC+8)
      process.env.TZ = 'Asia/Hong_Kong';

      // Get tomorrow's date as a date-only ISO string (YYYY-MM-DD)
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDateString = tomorrow.toISOString().split('T')[0];

      const result = formatDateISOStringToRelativeDate({
        isoDate: tomorrowDateString,
        isDayMaximumPrecision: true,
        localeCatalog,
      });

      expect(result).toBe('Tomorrow');
    });

    it('should display "Yesterday" for yesterday DATE field in UTC+8 timezone', () => {
      // Set timezone to HKT (UTC+8)
      process.env.TZ = 'Asia/Hong_Kong';

      // Get yesterday's date as a date-only ISO string (YYYY-MM-DD)
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDateString = yesterday.toISOString().split('T')[0];

      const result = formatDateISOStringToRelativeDate({
        isoDate: yesterdayDateString,
        isDayMaximumPrecision: true,
        localeCatalog,
      });

      expect(result).toBe('Yesterday');
    });
  });

  describe('Today handling', () => {
    it('should display "Today" for today DATE field across different timezones', () => {
      const timezones = ['America/New_York', 'America/Los_Angeles', 'UTC', 'Europe/Paris', 'Asia/Hong_Kong'];

      timezones.forEach((tz) => {
        process.env.TZ = tz;

        // Get today's date as a date-only ISO string (YYYY-MM-DD)
        const now = new Date();
        const todayDateString = now.toISOString().split('T')[0];

        const result = formatDateISOStringToRelativeDate({
          isoDate: todayDateString,
          isDayMaximumPrecision: true,
          localeCatalog,
        });

        expect(result).toBe('Today');
      });
    });
  });
});
