import { getMinutesDescription } from '@/workflow/workflow-trigger/utils/cron-to-human/descriptors/getMinutesDescription';
import { DEFAULT_CRON_DESCRIPTION_OPTIONS } from '@/workflow/workflow-trigger/utils/cron-to-human/types/cronDescriptionOptions';

describe('getMinutesDescription', () => {
  const options = DEFAULT_CRON_DESCRIPTION_OPTIONS;

  it('should handle wildcard', () => {
    expect(getMinutesDescription('*', options)).toBe('every minute');
  });

  it('should handle step values', () => {
    expect(getMinutesDescription('*/5', options)).toBe('every 5 minutes');
    expect(getMinutesDescription('*/15', options)).toBe('every 15 minutes');
    expect(getMinutesDescription('*/1', options)).toBe('every minute');
  });

  it('should handle range with step', () => {
    expect(getMinutesDescription('10-30/5', options)).toBe(
      'every 5 minutes, between minute 10 and 30',
    );
  });

  it('should handle ranges', () => {
    expect(getMinutesDescription('10-20', options)).toBe(
      'between minute 10 and 20',
    );
    expect(getMinutesDescription('0-59', options)).toBe(
      'between minute 0 and 59',
    );
  });

  it('should handle lists', () => {
    expect(getMinutesDescription('10,20', options)).toBe(
      'at minutes 10 and 20',
    );
    expect(getMinutesDescription('0,15,30,45', options)).toBe(
      'at minutes 0, 15, 30 and 45',
    );
  });

  it('should handle single values', () => {
    expect(getMinutesDescription('0', options)).toBe('at the top of the hour');
    expect(getMinutesDescription('1', options)).toBe(
      'at 1 minute past the hour',
    );
    expect(getMinutesDescription('30', options)).toBe(
      'at 30 minutes past the hour',
    );
  });

  it('should handle edge cases', () => {
    expect(getMinutesDescription('', options)).toBe('');
    expect(getMinutesDescription('   ', options)).toBe('');
    expect(getMinutesDescription('invalid', options)).toBe('invalid');
  });
});
