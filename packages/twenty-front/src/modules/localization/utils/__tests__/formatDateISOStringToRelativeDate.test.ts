import { enUS } from 'date-fns/locale';
import { Temporal } from 'temporal-polyfill';

import { formatDateISOStringToRelativeDate } from '@/localization/utils/formatDateISOStringToRelativeDate';

const previousTZ = process.env.TZ;
process.env.TZ = 'America/Los_Angeles';
afterAll(() => {
  if (previousTZ === undefined) {
    delete process.env.TZ;
  } else {
    process.env.TZ = previousTZ;
  }
});

const toDateOnly = (offsetDays: number): string => {
  return Temporal.Now.plainDateISO().add({ days: offsetDays }).toString();
};

const call = (isoDate: string, isDayMaximumPrecision = true) =>
  formatDateISOStringToRelativeDate({
    isoDate,
    isDayMaximumPrecision,
    localeCatalog: enUS,
  });

describe('formatDateISOStringToRelativeDate', () => {
  describe('isDayMaximumPrecision with date-only strings', () => {
    it('returns Today for today', () => {
      expect(call(toDateOnly(0))).toBe('Today');
    });

    it('returns Tomorrow for tomorrow', () => {
      expect(call(toDateOnly(1))).toBe('Tomorrow');
    });

    it('returns Yesterday for yesterday', () => {
      expect(call(toDateOnly(-1))).toBe('Yesterday');
    });

    it('returns a distance string for dates further away', () => {
      expect(call(toDateOnly(5))).toMatch(/5 days/);
    });
  });

  describe('regression — west-of-UTC timezone (America/Los_Angeles)', () => {
    it('tomorrow resolves to Tomorrow, not Today', () => {
      expect(call(toDateOnly(1))).toBe('Tomorrow');
    });

    it('today resolves to Today, not Yesterday', () => {
      expect(call(toDateOnly(0))).toBe('Today');
    });
  });

  describe('full datetime strings', () => {
    it('handles a UTC datetime string without throwing', () => {
      expect(() => call(new Date().toISOString(), false)).not.toThrow();
    });

    it('returns an hour-based distance for a datetime 2 hours ago', () => {
      const twoHoursAgo = new Date(
        Date.now() - 2 * 60 * 60 * 1000,
      ).toISOString();
      expect(call(twoHoursAgo, false)).toMatch(/hour/);
    });
  });
});
