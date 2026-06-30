import { DateFormat } from '@/localization/constants/DateFormat';
import { FieldDateDisplayFormat } from '@/object-record/record-field/ui/types/FieldMetadata';
import { subDays } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { formatDateString } from '~/utils/string/formatDateString';

describe('formatDateString', () => {
  const defaultParams = {
    timeZone: 'UTC',
    dateFormat: DateFormat.DAY_FIRST,
  };

  it('should return empty string for null value', () => {
    const result = formatDateString({
      ...defaultParams,
      value: null,
      localeCatalog: enUS,
    });

    expect(result).toBe('');
  });

  it('should return empty string for undefined value', () => {
    const result = formatDateString({
      ...defaultParams,
      value: undefined,
      localeCatalog: enUS,
    });

    expect(result).toBe('');
  });

  it('should format date as relative when displayFormat is set to RELATIVE', () => {
    const mockDate = subDays(new Date(), 2).toISOString();
    const mockRelativeDate = '2 days ago';

    const result = formatDateString({
      ...defaultParams,
      value: mockDate,
      dateFieldSettings: {
        displayFormat: FieldDateDisplayFormat.RELATIVE,
      },
      localeCatalog: enUS,
    });

    expect(result).toBe(mockRelativeDate);
  });

  it('should format date as datetime when displayFormat is set to USER_SETTINGS', () => {
    const mockDate = '2023-01-01T12:00:00Z';
    const mockFormattedDate = '1 Jan, 2023';

    jest.mock('@/localization/utils/formatDateISOStringToDateTime', () => ({
      formatDateISOStringToDateTime: jest
        .fn()
        .mockReturnValue(mockFormattedDate),
    }));

    const result = formatDateString({
      ...defaultParams,
      value: mockDate,
      dateFieldSettings: {
        displayFormat: FieldDateDisplayFormat.USER_SETTINGS,
      },
      localeCatalog: enUS,
    });

    expect(result).toBe(mockFormattedDate);
  });

  it('should format date with custom format when displayFormat is set to CUSTOM', () => {
    const mockDate = '2023-01-01T12:00:00Z';
    const mockFormattedDate = '2023';

    jest.mock(
      '@/localization/utils/formatDateISOStringToCustomUnicodeFormat',
      () => ({
        formatDateISOStringToCustomUnicodeFormat: jest
          .fn()
          .mockReturnValue(mockFormattedDate),
      }),
    );

    const result = formatDateString({
      ...defaultParams,
      value: mockDate,
      dateFieldSettings: {
        displayFormat: FieldDateDisplayFormat.CUSTOM,
        customUnicodeDateFormat: 'yyyy',
      },
      localeCatalog: enUS,
    });

    expect(result).toBe(mockFormattedDate);
  });

  it('should format date as datetime by default when displayFormat is not provided', () => {
    const mockDate = '2023-01-01T12:00:00Z';
    const mockFormattedDate = '1 Jan, 2023';

    jest.mock('@/localization/utils/formatDateISOStringToDateTime', () => ({
      formatDateISOStringToDateTime: jest
        .fn()
        .mockReturnValue(mockFormattedDate),
    }));

    const result = formatDateString({
      ...defaultParams,
      value: mockDate,
      localeCatalog: enUS,
    });

    expect(result).toBe(mockFormattedDate);
  });

  describe('date-only values across user timezones', () => {
    it('should render the same calendar date for a UTC user', () => {
      const result = formatDateString({
        ...defaultParams,
        value: '2022-01-01',
        timeZone: 'UTC',
        localeCatalog: enUS,
      });

      expect(result).toBe('1 Jan, 2022');
    });

    it('should render the same calendar date for a negative-offset user', () => {
      const result = formatDateString({
        ...defaultParams,
        value: '2022-01-01',
        timeZone: 'America/Los_Angeles',
        localeCatalog: enUS,
      });

      expect(result).toBe('1 Jan, 2022');
    });

    it('should render the same calendar date for a positive-offset user', () => {
      const result = formatDateString({
        ...defaultParams,
        value: '2022-01-01',
        timeZone: 'Asia/Tokyo',
        localeCatalog: enUS,
      });

      expect(result).toBe('1 Jan, 2022');
    });

    it('should render a date-only value with CUSTOM displayFormat without timezone shift', () => {
      const result = formatDateString({
        ...defaultParams,
        value: '2022-01-01',
        timeZone: 'America/Los_Angeles',
        dateFieldSettings: {
          displayFormat: FieldDateDisplayFormat.CUSTOM,
          customUnicodeDateFormat: 'yyyy-MM-dd',
        },
        localeCatalog: enUS,
      });

      expect(result).toBe('2022-01-01');
    });
  });

  describe('date-only values with RELATIVE displayFormat across timezones', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should return "Tomorrow" when the target value is the next calendar day in the user timezone', () => {
      // 2026-05-18 13:00 UTC: today in UTC is May 18, so "2026-05-19" is tomorrow.
      jest.setSystemTime(new Date('2026-05-18T13:00:00Z'));

      const result = formatDateString({
        ...defaultParams,
        value: '2026-05-19',
        timeZone: 'UTC',
        dateFieldSettings: {
          displayFormat: FieldDateDisplayFormat.RELATIVE,
        },
        localeCatalog: enUS,
      });

      expect(result).toBe('Tomorrow');
    });

    it('should return "Today" for the same value when the user timezone has already rolled over', () => {
      // 2026-05-18 21:00 UTC = 2026-05-19 06:00 in Asia/Tokyo, so "2026-05-19" is today there.
      jest.setSystemTime(new Date('2026-05-18T21:00:00Z'));

      const result = formatDateString({
        ...defaultParams,
        value: '2026-05-19',
        timeZone: 'Asia/Tokyo',
        dateFieldSettings: {
          displayFormat: FieldDateDisplayFormat.RELATIVE,
        },
        localeCatalog: enUS,
      });

      expect(result).toBe('Today');
    });
  });
});
