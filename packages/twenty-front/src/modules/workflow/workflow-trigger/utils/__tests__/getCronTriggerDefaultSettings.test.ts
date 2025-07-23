import { getCronTriggerDefaultSettings } from '@/workflow/workflow-trigger/utils/getCronTriggerDefaultSettings';

describe('getCronTriggerDefaultSettings', () => {
  it('returns correct settings for DAYS interval', () => {
    const result = getCronTriggerDefaultSettings('DAYS');
    expect(result).toEqual({
      schedule: { day: 1, hour: 0, minute: 0 },
      type: 'DAYS',
      outputSchema: {},
    });
  });

  it('returns correct settings for HOURS interval', () => {
    const result = getCronTriggerDefaultSettings('HOURS');
    expect(result).toEqual({
      schedule: { hour: 1, minute: 0 },
      type: 'HOURS',
      outputSchema: {},
    });
  });

  it('returns correct settings for MINUTES interval', () => {
    const result = getCronTriggerDefaultSettings('MINUTES');
    expect(result).toEqual({
      schedule: { minute: 1 },
      type: 'MINUTES',
      outputSchema: {},
    });
  });

  it('returns correct settings for CUSTOM interval', () => {
    const DEFAULT_CRON_PATTERN = '0 */1 * * *';
    const result = getCronTriggerDefaultSettings('CUSTOM');
    expect(result).toEqual({
      pattern: DEFAULT_CRON_PATTERN,
      type: 'CUSTOM',
      outputSchema: {},
    });
  });

  it('throws an error for an invalid interval', () => {
    // @ts-expect-error Testing invalid input
    expect(() => getCronTriggerDefaultSettings('INVALID')).toThrowError(
      'Invalid cron trigger interval',
    );
  });
});
