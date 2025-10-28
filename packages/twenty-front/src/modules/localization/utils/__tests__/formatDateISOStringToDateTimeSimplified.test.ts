import { TimeFormat } from '@/localization/constants/TimeFormat';
import { detectDateFormat } from '@/localization/utils/detection/detectDateFormat';
import { formatDateISOStringToDateTimeSimplified } from '@/localization/utils/formatDateISOStringToDateTimeSimplified';
import { formatInTimeZone } from 'date-fns-tz';

jest.mock('@/localization/utils/detection/detectDateFormat');
jest.mock('date-fns-tz');

const mockDetectDateFormat = detectDateFormat as jest.MockedFunction<
  typeof detectDateFormat
>;
const mockFormatInTimeZone = formatInTimeZone as jest.MockedFunction<
  typeof formatInTimeZone
>;

describe('formatDateISOStringToDateTimeSimplified', () => {
  const mockDate = new Date('2023-08-15T10:30:00Z');
  const mockTimeZone = 'America/New_York';
  const mockTimeFormat = TimeFormat.HOUR_24;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should format the date correctly when DATE_FORMAT is MONTH_FIRST', () => {
    mockDetectDateFormat.mockReturnValue('MONTH_FIRST');
    mockFormatInTimeZone.mockReturnValue('Oct 15 · 06:30');

    const result = formatDateISOStringToDateTimeSimplified(
      mockDate,
      mockTimeZone,
      mockTimeFormat,
    );

    expect(mockDetectDateFormat).toHaveBeenCalled();
    expect(mockFormatInTimeZone).toHaveBeenCalledWith(
      mockDate,
      mockTimeZone,
      'MMM d · HH:mm',
    );
    expect(result).toBe('Oct 15 · 06:30');
  });

  it('should format the date correctly when DATE_FORMAT is DAY_FIRST', () => {
    mockDetectDateFormat.mockReturnValue('DAY_FIRST');
    mockFormatInTimeZone.mockReturnValue('15 Oct · 06:30');

    const result = formatDateISOStringToDateTimeSimplified(
      mockDate,
      mockTimeZone,
      mockTimeFormat,
    );

    expect(mockDetectDateFormat).toHaveBeenCalled();
    expect(mockFormatInTimeZone).toHaveBeenCalledWith(
      mockDate,
      mockTimeZone,
      'd MMM · HH:mm',
    );
    expect(result).toBe('15 Oct · 06:30');
  });

  it('should use the provided time format', () => {
    mockDetectDateFormat.mockReturnValue('MONTH_FIRST');
    mockFormatInTimeZone.mockReturnValue('Oct 15 · 6:30 AM');

    const result = formatDateISOStringToDateTimeSimplified(
      mockDate,
      mockTimeZone,
      TimeFormat.HOUR_12,
    );

    expect(mockFormatInTimeZone).toHaveBeenCalledWith(
      mockDate,
      mockTimeZone,
      'MMM d · h:mm aa',
    );
    expect(result).toBe('Oct 15 · 6:30 AM');
  });

  it('should handle different time zones', () => {
    mockDetectDateFormat.mockReturnValue('MONTH_FIRST');
    mockFormatInTimeZone.mockReturnValue('Oct 16 · 02:30');

    const result = formatDateISOStringToDateTimeSimplified(
      mockDate,
      'Asia/Tokyo',
      mockTimeFormat,
    );

    expect(mockFormatInTimeZone).toHaveBeenCalledWith(
      mockDate,
      'Asia/Tokyo',
      'MMM d · HH:mm',
    );
    expect(result).toBe('Oct 16 · 02:30');
  });
});
