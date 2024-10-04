import { DateFormat } from '@/localization/constants/DateFormat';
import { detectDateFormat } from '@/localization/utils/detectDateFormat';

describe('detectDateFormat', () => {
  it('should return DateFormat.MONTH_FIRST if the detected format starts with month', () => {
    // Mock the Intl.DateTimeFormat to return a specific format
    const mockDateTimeFormat = jest.fn().mockReturnValue({
      formatToParts: () => [
        { type: 'month', value: '01' },
        { type: 'day', value: '01' },
        { type: 'year', value: '2022' },
      ],
      supportedLocalesOf: () => [],
    }) as any;
    global.Intl.DateTimeFormat = mockDateTimeFormat;

    const result = detectDateFormat();

    expect(result).toBe(DateFormat.MONTH_FIRST);
  });

  it('should return DateFormat.DAY_FIRST if the detected format starts with day', () => {
    // Mock the Intl.DateTimeFormat to return a specific format
    const mockDateTimeFormat = jest.fn().mockReturnValue({
      formatToParts: () => [
        { type: 'day', value: '01' },
        { type: 'month', value: '01' },
        { type: 'year', value: '2022' },
      ],
    }) as any;
    global.Intl.DateTimeFormat = mockDateTimeFormat;

    const result = detectDateFormat();

    expect(result).toBe(DateFormat.DAY_FIRST);
  });

  it('should return DateFormat.YEAR_FIRST if the detected format starts with year', () => {
    // Mock the Intl.DateTimeFormat to return a specific format
    const mockDateTimeFormat = jest.fn().mockReturnValue({
      formatToParts: () => [
        { type: 'year', value: '2022' },
        { type: 'month', value: '01' },
        { type: 'day', value: '01' },
      ],
    }) as any;
    global.Intl.DateTimeFormat = mockDateTimeFormat;

    const result = detectDateFormat();

    expect(result).toBe(DateFormat.YEAR_FIRST);
  });

  it('should return DateFormat.MONTH_FIRST by default if the detected format does not match any specific order', () => {
    // Mock the Intl.DateTimeFormat to return a specific format
    const mockDateTimeFormat = jest.fn().mockReturnValue({
      formatToParts: () => [
        { type: 'hour', value: '12' },
        { type: 'minute', value: '00' },
        { type: 'second', value: '00' },
      ],
    }) as any;
    global.Intl.DateTimeFormat = mockDateTimeFormat;

    const result = detectDateFormat();

    expect(result).toBe(DateFormat.MONTH_FIRST);
  });
});
