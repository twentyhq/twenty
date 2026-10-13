import { buildApplicationRegistrationAnalyticsBreakdown } from 'src/engine/core-modules/application/application-registration-analytics/utils/build-application-registration-analytics-breakdown.util';

describe('buildApplicationRegistrationAnalyticsBreakdown', () => {
  it('should sum the kept daily cells per key and sort them descending', () => {
    expect(
      buildApplicationRegistrationAnalyticsBreakdown({
        rows: [
          { key: 'TIMEOUT', date: '2026-10-01', value: 2, workspaceCount: 3 },
          { key: 'TIMEOUT', date: '2026-10-02', value: '5', workspaceCount: 4 },
          { key: 'THROWN', date: '2026-10-01', value: 9, workspaceCount: 3 },
        ],
      }),
    ).toEqual([
      { key: 'THROWN', value: 9 },
      { key: 'TIMEOUT', value: 7 },
    ]);
  });

  it('should drop a key only seen in too few workspaces', () => {
    expect(
      buildApplicationRegistrationAnalyticsBreakdown({
        rows: [
          { key: 'TIMEOUT', date: '2026-10-01', value: 2, workspaceCount: 3 },
          { key: 'THROWN', date: '2026-10-01', value: 90, workspaceCount: 1 },
          { key: 'THROWN', date: '2026-10-02', value: 90, workspaceCount: 2 },
        ],
      }),
    ).toEqual([{ key: 'TIMEOUT', value: 2 }]);
  });

  it('should apply the value conversion after summing', () => {
    expect(
      buildApplicationRegistrationAnalyticsBreakdown({
        rows: [
          {
            key: 'enrich',
            date: '2026-10-01',
            value: 1_000_000,
            workspaceCount: 3,
          },
          {
            key: 'enrich',
            date: '2026-10-02',
            value: 500_000,
            workspaceCount: 3,
          },
        ],
        convertValue: (value) => value / 1_000_000,
      }),
    ).toEqual([{ key: 'enrich', value: 1.5 }]);
  });

  it('should return nothing for a single-install app', () => {
    expect(
      buildApplicationRegistrationAnalyticsBreakdown({
        rows: [
          { key: 'THROWN', date: '2026-10-01', value: 4, workspaceCount: 1 },
        ],
      }),
    ).toEqual([]);
  });
});
