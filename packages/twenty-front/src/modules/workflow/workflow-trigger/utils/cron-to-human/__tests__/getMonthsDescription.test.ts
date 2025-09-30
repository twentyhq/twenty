import { getMonthsDescription } from '@/workflow/workflow-trigger/utils/cron-to-human/descriptors/getMonthsDescription';
import { DEFAULT_CRON_DESCRIPTION_OPTIONS } from '@/workflow/workflow-trigger/utils/cron-to-human/types/cronDescriptionOptions';

describe('getMonthsDescription', () => {
  const options = DEFAULT_CRON_DESCRIPTION_OPTIONS;

  it('should handle wildcard (every month)', () => {
    expect(getMonthsDescription('*', options)).toBe('');
  });

  it('should handle single months', () => {
    expect(getMonthsDescription('1', options)).toBe('only in January');
    expect(getMonthsDescription('6', options)).toBe('only in June');
    expect(getMonthsDescription('12', options)).toBe('only in December');
  });

  it('should handle step values', () => {
    expect(getMonthsDescription('*/3', options)).toBe('every 3 months');
    expect(getMonthsDescription('*/6', options)).toBe('every 6 months');
    expect(getMonthsDescription('*/1', options)).toBe('');
  });

  it('should handle range with step', () => {
    expect(getMonthsDescription('1-6/2', options)).toBe(
      'every 2 months, between January and June',
    );
    expect(getMonthsDescription('3-9/3', options)).toBe(
      'every 3 months, between March and September',
    );
  });

  it('should handle ranges', () => {
    expect(getMonthsDescription('1-6', options)).toBe(
      'between January and June',
    );
    expect(getMonthsDescription('6-8', options)).toBe(
      'between June and August',
    );
  });

  it('should handle lists', () => {
    expect(getMonthsDescription('1,6', options)).toBe(
      'only in January and June',
    );
    expect(getMonthsDescription('1,6,12', options)).toBe(
      'only in January, June and December',
    );
    expect(getMonthsDescription('3,6,9,12', options)).toBe(
      'only in March, June, September and December',
    );
  });

  it('should handle month start index options', () => {
    const optionsZeroIndex = { ...options, monthStartIndexZero: true };

    // When monthStartIndexZero is true, 0=January, 1=February, etc.
    expect(getMonthsDescription('0', optionsZeroIndex)).toBe('only in January');
    expect(getMonthsDescription('11', optionsZeroIndex)).toBe(
      'only in December',
    );
  });

  it('should handle edge cases', () => {
    expect(getMonthsDescription('', options)).toBe('');
    expect(getMonthsDescription('   ', options)).toBe('');
    expect(getMonthsDescription('invalid', options)).toBe('invalid');
  });

  describe('with locale catalog', () => {
    // Note: These tests would need a mock locale catalog to test properly
    // For now, we test that the function doesn't crash with locale
    it('should handle locale catalog without crashing', () => {
      // Create a proper mock locale with the required properties for date-fns
      const mockLocale = {
        localize: {
          month: () => 'MockMonth',
        },
        formatLong: {
          date: () => 'P',
          time: () => 'p',
          dateTime: () => 'Pp',
        },
      } as any;
      expect(() =>
        getMonthsDescription('1', options, mockLocale),
      ).not.toThrow();
    });
  });
});
