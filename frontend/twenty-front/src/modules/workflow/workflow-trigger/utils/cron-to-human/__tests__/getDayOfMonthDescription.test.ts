import { getDayOfMonthDescription } from '@/workflow/workflow-trigger/utils/cron-to-human/descriptors/getDayOfMonthDescription';
import { DEFAULT_CRON_DESCRIPTION_OPTIONS } from '@/workflow/workflow-trigger/utils/cron-to-human/types/cronDescriptionOptions';

describe('getDayOfMonthDescription', () => {
  const options = DEFAULT_CRON_DESCRIPTION_OPTIONS;

  it('should handle wildcard (every day)', () => {
    expect(getDayOfMonthDescription('*', options)).toBe('every day');
  });

  it('should handle last day of month', () => {
    expect(getDayOfMonthDescription('L', options)).toBe(
      'on the last day of the month',
    );
  });

  it('should handle single days', () => {
    expect(getDayOfMonthDescription('1', options)).toBe(
      'on the 1st of the month',
    );
    expect(getDayOfMonthDescription('2', options)).toBe(
      'on the 2nd of the month',
    );
    expect(getDayOfMonthDescription('3', options)).toBe(
      'on the 3rd of the month',
    );
    expect(getDayOfMonthDescription('15', options)).toBe(
      'on the 15th of the month',
    );
    expect(getDayOfMonthDescription('21', options)).toBe(
      'on the 21st of the month',
    );
    expect(getDayOfMonthDescription('22', options)).toBe(
      'on the 22nd of the month',
    );
    expect(getDayOfMonthDescription('23', options)).toBe(
      'on the 23rd of the month',
    );
    expect(getDayOfMonthDescription('31', options)).toBe(
      'on the 31st of the month',
    );
  });

  it('should handle step values', () => {
    expect(getDayOfMonthDescription('*/5', options)).toBe('every 5 days');
    expect(getDayOfMonthDescription('*/1', options)).toBe('every day');
    expect(getDayOfMonthDescription('*/10', options)).toBe('every 10 days');
  });

  it('should handle range with step', () => {
    expect(getDayOfMonthDescription('1-15/3', options)).toBe(
      'every 3 days, between the 1st and 15th of the month',
    );
    expect(getDayOfMonthDescription('10-20/2', options)).toBe(
      'every 2 days, between the 10th and 20th of the month',
    );
  });

  it('should handle ranges', () => {
    expect(getDayOfMonthDescription('1-15', options)).toBe(
      'between the 1st and 15th of the month',
    );
    expect(getDayOfMonthDescription('10-20', options)).toBe(
      'between the 10th and 20th of the month',
    );
  });

  it('should handle lists', () => {
    expect(getDayOfMonthDescription('1,15', options)).toBe(
      'on the 1st and 15th of the month',
    );
    expect(getDayOfMonthDescription('1,10,20,31', options)).toBe(
      'on the 1st, 10th, 20th and 31st of the month',
    );
  });

  it('should handle weekday specifier', () => {
    expect(getDayOfMonthDescription('15W', options)).toBe(
      'on the weekday closest to the 15th of the month',
    );
    expect(getDayOfMonthDescription('1W', options)).toBe(
      'on the weekday closest to the 1st of the month',
    );
    expect(getDayOfMonthDescription('W', options)).toBe('on weekdays only');
  });

  it('should handle ordinal numbers correctly', () => {
    // Test ordinal suffix logic
    expect(getDayOfMonthDescription('11', options)).toBe(
      'on the 11th of the month',
    );
    expect(getDayOfMonthDescription('12', options)).toBe(
      'on the 12th of the month',
    );
    expect(getDayOfMonthDescription('13', options)).toBe(
      'on the 13th of the month',
    );
  });

  it('should handle edge cases', () => {
    expect(getDayOfMonthDescription('', options)).toBe('');
    expect(getDayOfMonthDescription('   ', options)).toBe('');
    expect(getDayOfMonthDescription('invalid', options)).toBe('invalid');
  });
});
