import { detectDateFormat } from '@/localization/utils/detection/detectDateFormat';

const originalDateTimeFormat = Intl.DateTimeFormat;

const setMockDateTimeFormatParts = (parts: Intl.DateTimeFormatPart[]) => {
  class MockDateTimeFormat {
    formatToParts() {
      return parts;
    }
  }

  // @ts-expect-error - override Intl.DateTimeFormat for test
  global.Intl.DateTimeFormat = MockDateTimeFormat;
};

afterEach(() => {
  global.Intl.DateTimeFormat = originalDateTimeFormat;
});

describe('detectDateFormat', () => {
  it('should return MONTH_FIRST if the detected format starts with month', () => {
    setMockDateTimeFormatParts([
      { type: 'month', value: '01' },
      { type: 'day', value: '01' },
      { type: 'year', value: '2022' },
    ]);

    const result = detectDateFormat();

    expect(result).toBe('MONTH_FIRST');
  });

  it('should return DAY_FIRST if the detected format starts with day', () => {
    setMockDateTimeFormatParts([
      { type: 'day', value: '01' },
      { type: 'month', value: '01' },
      { type: 'year', value: '2022' },
    ]);

    const result = detectDateFormat();

    expect(result).toBe('DAY_FIRST');
  });

  it('should return YEAR_FIRST if the detected format starts with year', () => {
    setMockDateTimeFormatParts([
      { type: 'year', value: '2022' },
      { type: 'month', value: '01' },
      { type: 'day', value: '01' },
    ]);

    const result = detectDateFormat();

    expect(result).toBe('YEAR_FIRST');
  });

  it('should return MONTH_FIRST by default if the detected format does not match any specific order', () => {
    setMockDateTimeFormatParts([
      { type: 'hour', value: '12' },
      { type: 'minute', value: '00' },
      { type: 'second', value: '00' },
    ]);

    const result = detectDateFormat();

    expect(result).toBe('MONTH_FIRST');
  });
});
