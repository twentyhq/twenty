import { describeCronExpression } from '@/workflow/workflow-trigger/utils/cron-to-human/describeCronExpression';

describe('cronstrue comparison tests', () => {
  describe('comparing with cronstrue examples', () => {
    it('should handle "* * * * *" like cronstrue', () => {
      // cronstrue: "Every minute"
      expect(describeCronExpression('* * * * *')).toBe('every minute');
    });

    it('should handle "0 23 * * 1-5" like cronstrue', () => {
      // cronstrue: "At 11:00 PM, Monday through Friday" (but we use 24h format)
      expect(describeCronExpression('0 23 * * 1-5')).toBe(
        'at 23:00 UTC on weekdays',
      );
    });

    it('should handle "0 23 * * *" like cronstrue', () => {
      // cronstrue: "At 11:00 PM, every day" (but we use 24h format and simpler wording)
      expect(describeCronExpression('0 23 * * *')).toBe('at 23:00 UTC');
    });

    it('should handle "23 12 * * 0#2" like cronstrue', () => {
      // cronstrue: "At 12:23 PM, on the second Sunday of the month" (but we use 24h format)
      expect(describeCronExpression('23 12 * * 0#2')).toBe(
        'at 12:23 UTC on the second Sunday of the month',
      );
    });

    it('should handle "23 14 * * 0#2" like cronstrue', () => {
      // cronstrue: "At 14:23, on the second Sunday of the month"
      expect(describeCronExpression('23 14 * * 0#2')).toBe(
        'at 14:23 UTC on the second Sunday of the month',
      );
    });

    it('should handle "* * * 6-8 *" like cronstrue', () => {
      // cronstrue: "Every minute, July through September" (with monthStartIndexZero: true)
      // Our version uses standard indexing (1-12) so 6-8 = June-August
      expect(describeCronExpression('* * * 6-8 *')).toBe(
        'every minute between June and August',
      );
    });
  });

  describe('additional complex patterns', () => {
    it('should handle business hours patterns', () => {
      expect(describeCronExpression('*/15 9-17 * * 1-5')).toBe(
        'every 15 minutes between 09:00 UTC and 17:00 UTC on weekdays',
      );
    });

    it('should handle monthly patterns', () => {
      expect(describeCronExpression('0 9 1 */3 *')).toBe(
        'at 09:00 UTC on the 1st of the month every 3 months',
      );
    });

    it('should handle last day patterns', () => {
      expect(describeCronExpression('0 23 L * *')).toBe(
        'at 23:00 UTC on the last day of the month',
      );
    });

    it('should handle last Friday patterns', () => {
      expect(describeCronExpression('0 17 * * 5L')).toBe(
        'at 17:00 UTC on the last Friday of the month',
      );
    });
  });

  describe('12-hour format comparison', () => {
    it('should format in 12-hour when requested', () => {
      expect(
        describeCronExpression('0 14 * * *', { use24HourTimeFormat: false }),
      ).toBe('at 2:00 PM UTC');
      expect(
        describeCronExpression('23 12 * * 0#2', { use24HourTimeFormat: false }),
      ).toBe('at 12:23 PM UTC on the second Sunday of the month');
    });
  });
});
