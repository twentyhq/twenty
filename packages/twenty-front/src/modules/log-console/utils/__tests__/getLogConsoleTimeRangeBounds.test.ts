import { getLogConsoleTimeRangeBounds } from '@/log-console/utils/getLogConsoleTimeRangeBounds';

const NOW = '2026-09-24T12:05:00Z';

describe('getLogConsoleTimeRangeBounds', () => {
  it('should send only the start of a preset', () => {
    expect(
      getLogConsoleTimeRangeBounds({
        timeRange: '24h',
        now: NOW,
        timeZone: 'Europe/Paris',
      }),
    ).toEqual({ start: '2026-09-23T12:05:00Z' });
  });

  it('should start today at midnight in the time zone', () => {
    expect(
      getLogConsoleTimeRangeBounds({
        timeRange: 'today',
        now: NOW,
        timeZone: 'Europe/Paris',
      }),
    ).toEqual({ start: '2026-09-23T22:00:00Z' });
  });

  it('should bound yesterday by midnights in the time zone', () => {
    expect(
      getLogConsoleTimeRangeBounds({
        timeRange: 'yesterday',
        now: '2026-10-26T12:00:00Z',
        timeZone: 'Europe/Paris',
      }),
    ).toEqual({ start: '2026-10-24T22:00:00Z', end: '2026-10-25T23:00:00Z' });
  });

  it('should keep a custom range as it is', () => {
    const customRange = {
      start: '2026-09-20T08:00:00Z',
      end: '2026-09-21T18:00:00Z',
    };

    expect(
      getLogConsoleTimeRangeBounds({
        timeRange: customRange,
        now: NOW,
        timeZone: 'UTC',
      }),
    ).toEqual(customRange);
  });
});
