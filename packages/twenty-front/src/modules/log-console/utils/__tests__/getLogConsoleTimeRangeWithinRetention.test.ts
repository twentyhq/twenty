import { getLogConsoleTimeRangeWithinRetention } from '@/log-console/utils/getLogConsoleTimeRangeWithinRetention';

describe('getLogConsoleTimeRangeWithinRetention', () => {
  it('should keep a time range within retention', () => {
    expect(
      getLogConsoleTimeRangeWithinRetention({
        timeRange: '24h',
        retentionInHours: 72,
      }),
    ).toBe('24h');
  });

  it('should fall back to the longest preset within retention', () => {
    expect(
      getLogConsoleTimeRangeWithinRetention({
        timeRange: '24h',
        retentionInHours: 2,
      }),
    ).toBe('1h');

    expect(
      getLogConsoleTimeRangeWithinRetention({
        timeRange: '7d',
        retentionInHours: 72,
      }),
    ).toBe('24h');
  });
});
