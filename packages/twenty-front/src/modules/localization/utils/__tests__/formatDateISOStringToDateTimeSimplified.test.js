import { detectDateFormat } from '@/localization/utils/detectDateFormat';
import { formatDateISOStringToDateTimeSimplified } from '@/localization/utils/formatDateISOStringToDateTimeSimplified';
import { formatInTimeZone } from 'date-fns-tz';
// Mock the imported modules
jest.mock('@/localization/utils/detectDateFormat');
jest.mock('date-fns-tz');

describe('formatDateISOStringToDateTimeSimplified', () => {
  const mockDate = new Date('2023-08-15T10:30:00Z');
  const mockTimeZone = 'America/New_York';
  const mockTimeFormat = 'HH:mm';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should format the date correctly when DATE_FORMAT is MONTH_FIRST', () => {
    detectDateFormat.mockReturnValue('MONTH_FIRST');
    formatInTimeZone.mockReturnValue('Oct 15 · 06:30');

    const result = formatDateISOStringToDateTimeSimplified(
      mockDate,
      mockTimeZone,
      mockTimeFormat,
    );

    expect(detectDateFormat).toHaveBeenCalled();
    expect(formatInTimeZone).toHaveBeenCalledWith(
      mockDate,
      mockTimeZone,
      'MMM d · HH:mm',
    );
    expect(result).toBe('Oct 15 · 06:30');
  });

  it('should format the date correctly when DATE_FORMAT is DAY_FIRST', () => {
    detectDateFormat.mockReturnValue('DAY_FIRST');
    formatInTimeZone.mockReturnValue('15 Oct · 06:30');

    const result = formatDateISOStringToDateTimeSimplified(
      mockDate,
      mockTimeZone,
      mockTimeFormat,
    );

    expect(detectDateFormat).toHaveBeenCalled();
    expect(formatInTimeZone).toHaveBeenCalledWith(
      mockDate,
      mockTimeZone,
      'd MMM · HH:mm',
    );
    expect(result).toBe('15 Oct · 06:30');
  });

  it('should use the provided time format', () => {
    detectDateFormat.mockReturnValue('MONTH_FIRST');
    formatInTimeZone.mockReturnValue('Oct 15 · 6:30 AM');

    const result = formatDateISOStringToDateTimeSimplified(
      mockDate,
      mockTimeZone,
      'h:mm aa',
    );

    expect(formatInTimeZone).toHaveBeenCalledWith(
      mockDate,
      mockTimeZone,
      'MMM d · h:mm aa',
    );
    expect(result).toBe('Oct 15 · 6:30 AM');
  });

  it('should handle different time zones', () => {
    detectDateFormat.mockReturnValue('MONTH_FIRST');
    formatInTimeZone.mockReturnValue('Oct 16 · 02:30');

    const result = formatDateISOStringToDateTimeSimplified(
      mockDate,
      'Asia/Tokyo',
      mockTimeFormat,
    );

    expect(formatInTimeZone).toHaveBeenCalledWith(
      mockDate,
      'Asia/Tokyo',
      'MMM d · HH:mm',
    );
    expect(result).toBe('Oct 16 · 02:30');
  });
});
