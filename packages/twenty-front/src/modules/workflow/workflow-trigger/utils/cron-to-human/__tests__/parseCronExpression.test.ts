import { parseCronExpression } from '@/workflow/workflow-trigger/utils/cron-to-human/utils/parseCronExpression';

describe('parseCronExpression', () => {
  it('should parse 4-field cron expression', () => {
    const result = parseCronExpression('0 * * *');
    expect(result).toEqual({
      seconds: '0',
      minutes: '0',
      hours: '0',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*',
    });
  });

  it('should parse 5-field cron expression', () => {
    const result = parseCronExpression('30 14 * * 1');
    expect(result).toEqual({
      seconds: '0',
      minutes: '30',
      hours: '14',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '1',
    });
  });

  it('should parse 6-field cron expression with seconds', () => {
    const result = parseCronExpression('15 30 14 * * 1');
    expect(result).toEqual({
      seconds: '15',
      minutes: '30',
      hours: '14',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '1',
    });
  });

  it('should throw error for invalid field count', () => {
    expect(() => parseCronExpression('* *')).toThrow(
      'Invalid cron expression format. Expected 4, 5, or 6 fields, got 2',
    );
  });

  it('should throw error for empty expression', () => {
    expect(() => parseCronExpression('')).toThrow(
      'Cron expression is required',
    );
  });

  it('should throw error for invalid cron syntax', () => {
    expect(() => parseCronExpression('invalid cron expression')).toThrow(
      'Invalid cron expression',
    );
  });

  it('should handle complex expressions with ranges and steps', () => {
    const result = parseCronExpression('*/15 9-17 1-15 1,6,12 1-5');
    expect(result).toEqual({
      seconds: '0',
      minutes: '*/15',
      hours: '9-17',
      dayOfMonth: '1-15',
      month: '1,6,12',
      dayOfWeek: '1-5',
    });
  });
});
