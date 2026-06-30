import { parseCronExpression } from '@/workflow/workflow-trigger/utils/cron-to-human/utils/parseCronExpression';

describe('parseCronExpression', () => {
  it('should parse 4-field cron expression', () => {
    const result = parseCronExpression('9 * * *');
    expect(result).toEqual({
      seconds: '0',
      minutes: '0',
      hours: '9',
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

  it('should parse 6-field cron expression', () => {
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

  it('should reject expressions with wrong field count', () => {
    expect(() => parseCronExpression('* *')).toThrow(
      'Invalid cron expression. Expected 4-6 fields, got 2',
    );
    expect(() => parseCronExpression('* * * * * * *')).toThrow(
      'Invalid cron expression. Expected 4-6 fields, got 7',
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

  it('should auto-correct expressions with missing asterisk before slash', () => {
    const result1 = parseCronExpression('1 /3 * * *');
    expect(result1).toEqual({
      seconds: '0',
      minutes: '1',
      hours: '*/3',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*',
    });

    const result2 = parseCronExpression('* /5 * * *');
    expect(result2).toEqual({
      seconds: '0',
      minutes: '*',
      hours: '*/5',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*',
    });
  });

  it('should auto-correct expressions starting with slash', () => {
    const result1 = parseCronExpression('/3 * * *');
    expect(result1).toEqual({
      seconds: '0',
      minutes: '0',
      hours: '*/3',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*',
    });

    const result2 = parseCronExpression('/3 * * * *');
    expect(result2).toEqual({
      seconds: '0',
      minutes: '*/3',
      hours: '*',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*',
    });
  });

  it('should auto-correct step patterns in day field', () => {
    const result = parseCronExpression('0 0 /7 * *');
    expect(result).toEqual({
      seconds: '0',
      minutes: '0',
      hours: '0',
      dayOfMonth: '*/7',
      month: '*',
      dayOfWeek: '*',
    });
  });

  it('should handle extra spaces in expressions', () => {
    const result = parseCronExpression('30  14  *  *  1');
    expect(result).toEqual({
      seconds: '0',
      minutes: '30',
      hours: '14',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '1',
    });
  });

  it('should reject expressions with out-of-range values', () => {
    expect(() => parseCronExpression('60 * * * *')).toThrow('Invalid cron');
    expect(() => parseCronExpression('0 25 * * *')).toThrow('Invalid cron');
    expect(() => parseCronExpression('0 0 32 * *')).toThrow('Invalid cron');
    expect(() => parseCronExpression('0 0 0 13 *')).toThrow('Invalid cron');
  });
});
