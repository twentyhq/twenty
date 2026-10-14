import { buildApplicationRegistrationAnalyticsVersionLineSeries } from '@/settings/application-registrations/utils/buildApplicationRegistrationAnalyticsVersionLineSeries';

describe('buildApplicationRegistrationAnalyticsVersionLineSeries', () => {
  it('should build one adoption series per version with short date labels', () => {
    const series = buildApplicationRegistrationAnalyticsVersionLineSeries([
      {
        version: '1.3.0',
        timeSeries: [
          { date: '2026-10-01', activeWorkspaces: 1 },
          { date: '2026-10-02', activeWorkspaces: 4 },
        ],
      },
      {
        version: '1.2.0',
        timeSeries: [
          { date: '2026-10-01', activeWorkspaces: 6 },
          { date: '2026-10-02', activeWorkspaces: 3 },
        ],
      },
    ]);

    expect(series).toEqual([
      {
        key: '1.3.0',
        label: '1.3.0',
        data: [
          { x: 'Oct 1', y: 1 },
          { x: 'Oct 2', y: 4 },
        ],
      },
      {
        key: '1.2.0',
        label: '1.2.0',
        data: [
          { x: 'Oct 1', y: 6 },
          { x: 'Oct 2', y: 3 },
        ],
      },
    ]);
  });
});
