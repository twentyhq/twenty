import { DateFormat } from '@/localization/constants/DateFormat';
import { DateTime } from 'luxon';
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
    });

    expect(result).toBe('');
  });

  it('should return empty string for undefined value', () => {
    const result = formatDateString({
      ...defaultParams,
      value: undefined,
    });

    expect(result).toBe('');
  });

  it('should format date as relative when displayFormat is set to relative_date', () => {
    const mockDate = DateTime.now().minus({ months: 2 }).toISO();
    const mockRelativeDate = 'about 2 months ago';

    jest.mock('@/localization/utils/formatDateISOStringToRelativeDate', () => ({
      formatDateISOStringToRelativeDate: jest
        .fn()
        .mockReturnValue(mockRelativeDate),
    }));

    const result = formatDateString({
      ...defaultParams,
      value: mockDate,
      displayFormat: 'relative_date',
    });

    expect(result).toBe(mockRelativeDate);
  });

  it('should format date as datetime when displayFormat is set to full_date', () => {
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
      displayFormat: 'full_date',
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
    });

    expect(result).toBe(mockFormattedDate);
  });

  it('should return only year from date value when displayFormat is set to year', () => {
    const mockDate = '2023-01-01T12:00:00Z';
    const mockFormattedDate = '2023';

    jest.mock('@/localization/utils/formatDateISOStringToYear', () => ({
      formatDateISOStringToDateTime: jest
        .fn()
        .mockReturnValue(mockFormattedDate),
    }));

    const result = formatDateString({
      ...defaultParams,
      value: mockDate,
      displayFormat: 'year',
    });

    expect(result).toBe(mockFormattedDate);
  });

  it('should return only time from date value when displayFormat is set to time', () => {
    const mockDate = '2023-01-01T12:00:00Z';
    const mockFormattedDate = '06:00:00';

    jest.mock('@/localization/utils/formatDateISOStringToTime', () => ({
      formatDateISOStringToDateTime: jest
        .fn()
        .mockReturnValue(mockFormattedDate),
    }));

    const result = formatDateString({
      ...defaultParams,
      timeZone: 'CST',
      value: mockDate,
      displayFormat: 'time',
    });

    expect(result).toBe(mockFormattedDate);
  });

  it('should return only date from date value when displayFormat is set to date', () => {
    const mockDate = '2023-01-01T12:00:00Z';
    const mockFormattedDate = 'January 2';

    jest.mock('@/localization/utils/formatDateISOStringToDate', () => ({
      formatDateISOStringToDateTime: jest
        .fn()
        .mockReturnValue(mockFormattedDate),
    }));

    const result = formatDateString({
      ...defaultParams,
      timeZone: 'Pacific/Kiritimati',
      value: mockDate,
      displayFormat: 'date',
    });

    expect(result).toBe(mockFormattedDate);
  });
});
