import { describeCronExpression } from '@/workflow/workflow-trigger/utils/cron-to-human/describeCronExpression';

describe('describeCronExpression', () => {
  describe('basic expressions', () => {
    it('should describe every minute', () => {
      expect(describeCronExpression('* * * * *')).toBe('every minute');
    });

    it('should describe every 5 minutes', () => {
      expect(describeCronExpression('*/5 * * * *')).toBe('every 5 minutes');
    });

    it('should describe every hour', () => {
      expect(describeCronExpression('0 * * * *')).toBe('every hour');
    });

    it('should describe every 2 hours', () => {
      expect(describeCronExpression('0 */2 * * *')).toBe('every 2 hours');
    });

    it('should describe daily at specific time', () => {
      expect(describeCronExpression('30 14 * * *')).toBe('at 14:30 UTC');
    });

    it('should describe daily at midnight', () => {
      expect(describeCronExpression('0 0 * * *')).toBe('at 00:00 UTC');
    });
  });

  describe('day-specific expressions', () => {
    it('should describe every day', () => {
      expect(describeCronExpression('0 9 * * *')).toBe('at 09:00 UTC');
    });

    it('should describe every 3 days', () => {
      expect(describeCronExpression('0 9 */3 * *')).toBe(
        'at 09:00 UTC every 3 days',
      );
    });

    it('should describe weekdays', () => {
      expect(describeCronExpression('0 9 * * 1-5')).toBe(
        'at 09:00 UTC on weekdays',
      );
    });

    it('should describe specific day of month', () => {
      expect(describeCronExpression('0 9 15 * *')).toBe(
        'at 09:00 UTC on the 15th of the month',
      );
    });

    it('should describe last day of month', () => {
      expect(describeCronExpression('0 9 L * *')).toBe(
        'at 09:00 UTC on the last day of the month',
      );
    });
  });

  describe('month-specific expressions', () => {
    it('should describe specific month', () => {
      expect(describeCronExpression('0 9 1 1 *')).toBe(
        'at 09:00 UTC on the 1st of the month only in January',
      );
    });

    it('should describe multiple months', () => {
      expect(describeCronExpression('0 9 * 1,6,12 *')).toBe(
        'at 09:00 UTC only in January, June and December',
      );
    });

    it('should describe month range', () => {
      expect(describeCronExpression('0 9 * 6-8 *')).toBe(
        'at 09:00 UTC between June and August',
      );
    });

    it('should describe every 3 months', () => {
      expect(describeCronExpression('0 9 1 */3 *')).toBe(
        'at 09:00 UTC on the 1st of the month every 3 months',
      );
    });
  });

  describe('complex expressions', () => {
    it('should describe business hours every 15 minutes on weekdays', () => {
      expect(describeCronExpression('*/15 9-17 * * 1-5')).toBe(
        'every 15 minutes between 09:00 UTC and 17:00 UTC on weekdays',
      );
    });

    it('should describe first Monday of every month', () => {
      expect(describeCronExpression('0 9 * * 1#1')).toBe(
        'at 09:00 UTC on the first Monday of the month',
      );
    });

    it('should describe last Friday of every month', () => {
      expect(describeCronExpression('0 17 * * 5L')).toBe(
        'at 17:00 UTC on the last Friday of the month',
      );
    });

    it('should describe multiple specific times', () => {
      expect(describeCronExpression('0 9,12,15 * * *')).toBe(
        'at 09:00 UTC, 12:00 UTC and 15:00 UTC',
      );
    });

    it('should describe range of minutes', () => {
      expect(describeCronExpression('15-45 * * * *')).toBe(
        'between minute 15 and 45',
      );
    });

    it('should describe specific minutes on specific hours', () => {
      expect(describeCronExpression('30 9,14 * * *')).toBe(
        'at 09:30 UTC and 14:30 UTC',
      );
    });
  });

  describe('real-world complex expressions', () => {
    it('should describe business hours every 15 minutes on weekdays', () => {
      expect(describeCronExpression('*/15 9-17 * * 1-5')).toBe(
        'every 15 minutes between 09:00 UTC and 17:00 UTC on weekdays',
      );
    });

    it('should describe quarterly reports', () => {
      expect(describeCronExpression('0 9 1 1,4,7,10 *')).toBe(
        'at 09:00 UTC on the 1st of the month only in January, April, July and October',
      );
    });

    it('should describe range of minutes', () => {
      expect(describeCronExpression('15-45 * * * *')).toBe(
        'between minute 15 and 45',
      );
    });

    it('should describe 4-field format expressions', () => {
      expect(describeCronExpression('9 * * *')).toBe('at 09:00 UTC');
      expect(describeCronExpression('*/2 * * *')).toBe('every 2 hours');
      expect(describeCronExpression('9 15 * *')).toBe(
        'at 09:00 UTC on the 15th of the month',
      );
      expect(describeCronExpression('9 * * 1')).toBe(
        'at 09:00 UTC only on Monday',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty expression', () => {
      expect(() => describeCronExpression('')).toThrow(
        'Cron expression is required',
      );
    });

    it('should handle invalid expression', () => {
      expect(() => describeCronExpression('invalid')).toThrow(
        'Failed to describe cron expression',
      );
    });

    it('should handle expression with too many fields', () => {
      expect(() => describeCronExpression('0 0 0 0 0 0 0 0')).toThrow(
        'Failed to describe cron expression',
      );
    });
  });

  describe('12-hour format', () => {
    it('should use 12-hour format when specified', () => {
      expect(
        describeCronExpression('0 14 * * *', { use24HourTimeFormat: false }),
      ).toBe('at 2:00 PM UTC');
    });

    it('should use 12-hour format for multiple times', () => {
      expect(
        describeCronExpression('0 9,14,18 * * *', {
          use24HourTimeFormat: false,
        }),
      ).toBe('at 9:00 AM UTC, 2:00 PM UTC and 6:00 PM UTC');
    });
  });
});
