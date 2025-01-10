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

  it('should format date as relative when displayAsRelativeDate is true', () => {
    const mockDate = DateTime.now().minus({ months: 2 }).toISO();
    const mockRelativeDate = '2 months ago';

    jest.mock('@/localization/utils/formatDateISOStringToRelativeDate', () => ({
      formatDateISOStringToRelativeDate: jest
        .fn()
        .mockReturnValue(mockRelativeDate),
    }));

    const result = formatDateString({
      ...defaultParams,
      value: mockDate,
      displayAsRelativeDate: true,
    });

    expect(result).toBe(mockRelativeDate);
  });

  it('should format date as datetime when displayAsRelativeDate is false', () => {
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
      displayAsRelativeDate: false,
    });

    expect(result).toBe(mockFormattedDate);
  });

  it('should format date as datetime by default when displayAsRelativeDate is not provided', () => {
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
});
