import { detectDateFormat } from '@/localization/utils/detectDateFormat';

describe('detectDateFormat', () => {
  it('should return MONTH_FIRST if the detected format starts with month', () => {
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

    expect(result).toBe('MONTH_FIRST');
  });

  it('should return DAY_FIRST if the detected format starts with day', () => {
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

    expect(result).toBe('DAY_FIRST');
  });

  it('should return YEAR_FIRST if the detected format starts with year', () => {
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

    expect(result).toBe('YEAR_FIRST');
  });

  it('should return MONTH_FIRST by default if the detected format does not match any specific order', () => {
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

    expect(result).toBe('MONTH_FIRST');
  });
});
