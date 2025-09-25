import { getHoursDescription } from '@/workflow/workflow-trigger/utils/cron-to-human/descriptors/getHoursDescription';
import { DEFAULT_CRON_DESCRIPTION_OPTIONS } from '@/workflow/workflow-trigger/utils/cron-to-human/types/cronDescriptionOptions';

describe('getHoursDescription', () => {
  const options24 = {
    ...DEFAULT_CRON_DESCRIPTION_OPTIONS,
    use24HourTimeFormat: true,
  };
  const options12 = {
    ...DEFAULT_CRON_DESCRIPTION_OPTIONS,
    use24HourTimeFormat: false,
  };

  describe('24-hour format', () => {
    it('should handle wildcard', () => {
      expect(getHoursDescription('*', '0', options24)).toBe('every hour');
    });

    it('should handle step values', () => {
      expect(getHoursDescription('*/2', '0', options24)).toBe('every 2 hours');
      expect(getHoursDescription('*/1', '0', options24)).toBe('every hour');
    });

    it('should handle range with step', () => {
      expect(getHoursDescription('9-17/2', '0', options24)).toBe(
        'every 2 hours, between 09:00 and 17:00',
      );
    });

    it('should handle ranges', () => {
      expect(getHoursDescription('9-17', '0', options24)).toBe(
        'between 09:00 and 17:00',
      );
    });

    it('should handle lists', () => {
      expect(getHoursDescription('9,12', '0', options24)).toBe(
        'at 09:00 and 12:00',
      );
      expect(getHoursDescription('9,12,15,18', '30', options24)).toBe(
        'at 09:30, 12:30, 15:30 and 18:30',
      );
    });

    it('should handle single values', () => {
      expect(getHoursDescription('9', '30', options24)).toBe('at 09:30');
      expect(getHoursDescription('0', '0', options24)).toBe('at 00:00');
      expect(getHoursDescription('23', '59', options24)).toBe('at 23:59');
    });
  });

  describe('12-hour format', () => {
    it('should format morning times', () => {
      expect(getHoursDescription('9', '30', options12)).toBe('at 9:30 AM');
      expect(getHoursDescription('0', '0', options12)).toBe('at 12:00 AM');
    });

    it('should format afternoon times', () => {
      expect(getHoursDescription('14', '30', options12)).toBe('at 2:30 PM');
      expect(getHoursDescription('12', '0', options12)).toBe('at 12:00 PM');
    });

    it('should format lists in 12-hour', () => {
      expect(getHoursDescription('9,14', '0', options12)).toBe(
        'at 9:00 AM and 2:00 PM',
      );
    });

    it('should format ranges in 12-hour', () => {
      expect(getHoursDescription('9-17', '0', options12)).toBe(
        'between 9:00 AM and 5:00 PM',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty hours', () => {
      expect(getHoursDescription('', '0', options24)).toBe('');
    });

    it('should handle invalid hours', () => {
      expect(getHoursDescription('invalid', '0', options24)).toBe('invalid');
    });
  });
});
