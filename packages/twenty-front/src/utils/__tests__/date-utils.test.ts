import { i18n } from '@lingui/core';
import { addDays, format, formatDistanceToNow, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { messages as enMessages } from '~/locales/generated/en';
import { messages as frMessages } from '~/locales/generated/fr-FR';

import {
  beautifyDateDiff,
  beautifyExactDate,
  beautifyExactDateTime,
  beautifyPastDateRelativeToNow,
  hasDatePassed,
  parseDate,
} from '~/utils/date-utils';
import { logError } from '~/utils/logError';

i18n.load(SOURCE_LOCALE, enMessages);
i18n.activate(SOURCE_LOCALE);

jest.mock('~/utils/logError');
jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

describe('beautifyExactDateTime', () => {
  it('should return the date in the correct format with time', () => {
    const mockDate = '2023-01-01T12:13:24';
    const actualDate = new Date(mockDate);
    const expected = format(actualDate, 'MMM d, yyyy · HH:mm');

    const result = beautifyExactDateTime(mockDate);
    expect(result).toEqual(expected);
  });
  it('should return the time in the correct format for a datetime that is today', () => {
    const todayString = '2024-01-01'; // Using the mocked date
    const mockDate = `${todayString}T12:13:24`;
    const actualDate = new Date(mockDate);
    const expected = format(actualDate, 'HH:mm');

    const result = beautifyExactDateTime(mockDate);
    expect(result).toEqual(expected);
  });
});

describe('beautifyExactDate', () => {
  it('should return the past date in the correct format without time', () => {
    const mockDate = '2023-01-01T12:13:24';
    const actualDate = new Date(mockDate);
    const expected = format(actualDate, 'MMM d, yyyy');

    const result = beautifyExactDate(mockDate);
    expect(result).toEqual(expected);
  });
  it('should return "Today" if the date is today', () => {
    const todayString = '2024-01-01'; // Using the mocked date
    const mockDate = `${todayString}T12:13:24`;
    const expected = 'Today';

    const result = beautifyExactDate(mockDate);
    expect(result).toEqual(expected);
  });
});

describe('parseDate', () => {
  it('should log an error and return empty string when passed an invalid date string', () => {
    expect(() => {
      parseDate('invalid-date-string');
    }).toThrow(
      Error('Invalid date passed to formatPastDate: "invalid-date-string"'),
    );
  });

  it('should log an error and return empty string when passed NaN', () => {
    expect(() => {
      parseDate(NaN);
    }).toThrow(Error('Invalid date passed to formatPastDate: "NaN"'));
  });

  it('should log an error and return empty string when passed invalid Date object', () => {
    expect(() => {
      parseDate(new Date(NaN));
    }).toThrow(Error('Invalid date passed to formatPastDate: "Invalid Date"'));
  });
});

describe('beautifyPastDateRelativeToNow', () => {
  it('should return the correct relative date', () => {
    const mockDate = '2023-01-01';
    const actualDate = new Date(mockDate);
    const expected = formatDistanceToNow(actualDate, { addSuffix: true });

    const result = beautifyPastDateRelativeToNow(mockDate);
    expect(result).toEqual(expected);
  });

  it('should log an error and return empty string when passed an invalid date string', () => {
    const result = beautifyPastDateRelativeToNow('invalid-date-string');

    expect(logError).toHaveBeenCalledWith(
      Error('Invalid date passed to formatPastDate: "invalid-date-string"'),
    );
    expect(result).toEqual('');
  });

  it('should log an error and return empty string when passed NaN', () => {
    const result = beautifyPastDateRelativeToNow(NaN);

    expect(logError).toHaveBeenCalledWith(
      Error('Invalid date passed to formatPastDate: "NaN"'),
    );
    expect(result).toEqual('');
  });

  it('should log an error and return empty string when passed invalid Date object', () => {
    const result = beautifyPastDateRelativeToNow(
      new Date('invalid-date-asdasd'),
    );

    expect(logError).toHaveBeenCalledWith(
      Error('Invalid date passed to formatPastDate: "Invalid Date"'),
    );
    expect(result).toEqual('');
  });
});

describe('hasDatePassed', () => {
  it('should log an error and return false when passed an invalid date string', () => {
    const result = hasDatePassed('invalid-date-string');

    expect(logError).toHaveBeenCalledWith(
      Error('Invalid date passed to formatPastDate: "invalid-date-string"'),
    );
    expect(result).toEqual(false);
  });

  it('should log an error and return false when passed NaN', () => {
    const result = hasDatePassed(NaN);

    expect(logError).toHaveBeenCalledWith(
      Error('Invalid date passed to formatPastDate: "NaN"'),
    );
    expect(result).toEqual(false);
  });

  it('should log an error and return false when passed invalid Date object', () => {
    const result = hasDatePassed(new Date(NaN));

    expect(logError).toHaveBeenCalledWith(
      Error('Invalid date passed to formatPastDate: "Invalid Date"'),
    );
    expect(result).toEqual(false);
  });

  it('should return true when passed past date', () => {
    const now = new Date();
    const pastDate = subDays(now, 1);

    const result = hasDatePassed(pastDate);
    expect(result).toEqual(true);
  });

  it('should return false when passed future date', () => {
    const now = new Date();
    const futureDate = addDays(now, 1);

    const result = hasDatePassed(futureDate);
    expect(result).toEqual(false);
  });

  it('should return false when passed current date', () => {
    const now = new Date();

    const result = hasDatePassed(now);
    expect(result).toEqual(false);
  });
});

describe('beautifyDateDiff', () => {
  it('should return the correct date diff', () => {
    const date = '2023-11-05T00:00:00.000Z';
    const dateToCompareWith = '2023-11-01T00:00:00.000Z';
    const result = beautifyDateDiff(date, dateToCompareWith);
    expect(result).toEqual('4 days');
  });
  it('should return the correct date diff for large diff', () => {
    const date = '2031-11-05T00:00:00.000Z';
    const dateToCompareWith = '2023-11-01T00:00:00.000Z';
    const result = beautifyDateDiff(date, dateToCompareWith);
    expect(result).toEqual('8 years and 4 days');
  });
  it('should return the correct date for negative diff', () => {
    const date = '2013-11-05T00:00:00.000Z';
    const dateToCompareWith = '2023-11-01T00:00:00.000Z';
    const result = beautifyDateDiff(date, dateToCompareWith);
    expect(result).toEqual('-9 years and -361 days');
  });
  it('should return the correct date diff for large diff', () => {
    const date = '2031-11-01T00:00:00.000Z';
    const dateToCompareWith = '2023-11-01T00:00:00.000Z';
    const result = beautifyDateDiff(date, dateToCompareWith);
    expect(result).toEqual('8 years');
  });
  it('should return the proper english date diff', () => {
    const date = '2024-11-02T00:00:00.000Z';
    const dateToCompareWith = '2023-11-01T00:00:00.000Z';
    const result = beautifyDateDiff(date, dateToCompareWith);
    expect(result).toEqual('1 year and 1 day');
  });
  it('should round date diff', () => {
    const date = '2024-11-03T14:04:43.421Z';
    const dateToCompareWith = '2023-11-01T00:00:00.000Z';
    const result = beautifyDateDiff(date, dateToCompareWith);
    expect(result).toEqual('1 year and 2 days');
  });
  it('should compare to now', () => {
    const date = '2027-01-10T00:00:00.000Z';
    const result = beautifyDateDiff(date);
    expect(result).toEqual('3 years and 9 days');
  });
  it('should return short version', () => {
    const date = '2031-11-05T00:00:00.000Z';
    const dateToCompareWith = '2023-11-01T00:00:00.000Z';
    const result = beautifyDateDiff(date, dateToCompareWith, true);
    expect(result).toEqual('8 years');
  });
  it('should return short version for short differences', () => {
    const date = '2023-11-05T00:00:00.000Z';
    const dateToCompareWith = '2023-11-01T00:00:00.000Z';
    const result = beautifyDateDiff(date, dateToCompareWith, true);
    expect(result).toEqual('4 days');
  });
});

describe('French locale tests', () => {
  beforeAll(() => {
    // Setup French i18n for these tests
    i18n.load('fr-FR', frMessages);
    i18n.activate('fr-FR');
  });

  afterAll(() => {
    // Restore English for other tests
    i18n.load('en', enMessages);
    i18n.activate('en');
  });

  describe('beautifyPastDateRelativeToNow with French locale', () => {
    it('should format very recent dates as "now" in French', () => {
      const pastDate = '2023-12-31T23:59:45.000Z'; // 15 seconds ago
      const result = beautifyPastDateRelativeToNow(pastDate, fr);
      expect(result).toBe('maintenant'); // French for "now"
    });

    it('should format 30 seconds ago in French', () => {
      const pastDate = '2023-12-31T23:59:30.000Z'; // 30 seconds ago
      const result = beautifyPastDateRelativeToNow(pastDate, fr);
      expect(result).toBe('il y a 30 secondes'); // French for "30 seconds ago"
    });

    it('should format minutes ago in French', () => {
      const pastDate = '2023-12-31T23:57:00.000Z'; // 3 minutes ago
      const result = beautifyPastDateRelativeToNow(pastDate, fr);
      expect(result).toContain('minute'); // Should contain French minute formatting
    });

    it('should format hours ago in French', () => {
      const pastDate = '2023-12-31T21:00:00.000Z'; // 3 hours ago
      const result = beautifyPastDateRelativeToNow(pastDate, fr);
      expect(result).toContain('heure'); // Should contain French hour formatting
    });

    it('should format days ago in French', () => {
      const pastDate = '2023-12-29T00:00:00.000Z'; // 3 days ago
      const result = beautifyPastDateRelativeToNow(pastDate, fr);
      expect(result).toContain('jour'); // Should contain French day formatting
    });
  });

  describe('beautifyDateDiff with French locale', () => {
    it('should use date-fns formatDistance for French when not short', () => {
      const date = '2025-01-01T00:00:00.000Z';
      const dateToCompareWith = '2024-01-01T00:00:00.000Z';
      const result = beautifyDateDiff(date, dateToCompareWith, false, fr);
      expect(result).toContain('an'); // French for year
    });

    it('should fall back to manual implementation for short format', () => {
      const date = '2025-01-01T00:00:00.000Z';
      const dateToCompareWith = '2024-01-01T00:00:00.000Z';
      const result = beautifyDateDiff(date, dateToCompareWith, true, fr);
      // Manual implementation with Lingui translations returns French
      expect(result).toContain('an'); // French for year (singular)
    });

    it('should handle mixed years and days in French', () => {
      const date = '2025-01-05T00:00:00.000Z';
      const dateToCompareWith = '2024-01-01T00:00:00.000Z';
      const result = beautifyDateDiff(date, dateToCompareWith, false, fr);
      // Should use date-fns which handles French properly
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('beautifyExactDate with French locale', () => {
    it('should translate "Today" to French', () => {
      const today = new Date('2024-01-01T12:00:00.000Z');
      const result = beautifyExactDate(today);
      expect(result).toBe("Aujourd'hui"); // French for "Today"
    });
  });
});
