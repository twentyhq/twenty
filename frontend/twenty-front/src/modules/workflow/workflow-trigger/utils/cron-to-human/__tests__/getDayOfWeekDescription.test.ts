import { getDayOfWeekDescription } from '@/workflow/workflow-trigger/utils/cron-to-human/descriptors/getDayOfWeekDescription';
import { DEFAULT_CRON_DESCRIPTION_OPTIONS } from '@/workflow/workflow-trigger/utils/cron-to-human/types/cronDescriptionOptions';

describe('getDayOfWeekDescription', () => {
  const options = DEFAULT_CRON_DESCRIPTION_OPTIONS;

  it('should handle wildcard (every day)', () => {
    expect(getDayOfWeekDescription('*', options)).toBe('');
  });

  it('should handle single days', () => {
    expect(getDayOfWeekDescription('0', options)).toBe('only on Sunday');
    expect(getDayOfWeekDescription('1', options)).toBe('only on Monday');
    expect(getDayOfWeekDescription('6', options)).toBe('only on Saturday');
    expect(getDayOfWeekDescription('7', options)).toBe('only on Sunday'); // 7 = Sunday
  });

  it('should handle weekdays', () => {
    expect(getDayOfWeekDescription('1-5', options)).toBe('on weekdays');
  });

  it('should handle weekends', () => {
    expect(getDayOfWeekDescription('0,6', options)).toBe(
      'only on Sunday and Saturday',
    );
  });

  it('should handle day ranges', () => {
    expect(getDayOfWeekDescription('1-3', options)).toBe(
      'from Monday to Wednesday',
    );
    expect(getDayOfWeekDescription('4-6', options)).toBe(
      'from Thursday to Saturday',
    );
  });

  it('should handle day lists', () => {
    expect(getDayOfWeekDescription('1,3,5', options)).toBe(
      'only on Monday, Wednesday and Friday',
    );
    expect(getDayOfWeekDescription('0,6', options)).toBe(
      'only on Sunday and Saturday',
    );
  });

  it('should handle step values', () => {
    expect(getDayOfWeekDescription('*/2', options)).toBe('every 2 days');
    expect(getDayOfWeekDescription('*/1', options)).toBe('every day');
  });

  it('should handle nth occurrence of weekday', () => {
    expect(getDayOfWeekDescription('1#1', options)).toBe(
      'on the first Monday of the month',
    );
    expect(getDayOfWeekDescription('5#2', options)).toBe(
      'on the second Friday of the month',
    );
    expect(getDayOfWeekDescription('0#3', options)).toBe(
      'on the third Sunday of the month',
    );
  });

  it('should handle last occurrence of weekday', () => {
    expect(getDayOfWeekDescription('1L', options)).toBe(
      'on the last Monday of the month',
    );
    expect(getDayOfWeekDescription('5L', options)).toBe(
      'on the last Friday of the month',
    );
  });

  it('should handle different start index options', () => {
    const optionsStartFromOne = { ...options, dayOfWeekStartIndexZero: false };

    // When dayOfWeekStartIndexZero is false, 1=Sunday, 2=Monday, etc.
    expect(getDayOfWeekDescription('2-6', optionsStartFromOne)).toBe(
      'on weekdays',
    );
  });

  it('should handle edge cases', () => {
    expect(getDayOfWeekDescription('', options)).toBe('');
    expect(getDayOfWeekDescription('   ', options)).toBe('');
    expect(getDayOfWeekDescription('invalid', options)).toBe('invalid');
  });
});
