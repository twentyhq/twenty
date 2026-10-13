import { buildApplicationRegistrationAnalyticsLineSeries } from '@/settings/application-registrations/utils/buildApplicationRegistrationAnalyticsLineSeries';

const buildPoint = ({
  date,
  ...values
}: {
  date: string;
  functionExecutions?: number;
  functionErrors?: number;
  creditsCharged?: number;
}) => ({
  date,
  installSucceeded: 0,
  installFailed: 0,
  upgradeSucceeded: 0,
  upgradeFailed: 0,
  uninstallSucceeded: 0,
  uninstallFailed: 0,
  functionExecutions: 0,
  functionErrors: 0,
  apiRateLimited: 0,
  jobRateLimited: 0,
  creditsCharged: 0,
  ...values,
});

describe('buildApplicationRegistrationAnalyticsLineSeries', () => {
  it('should build one series per definition with short date labels', () => {
    const series = buildApplicationRegistrationAnalyticsLineSeries({
      timeSeries: [
        buildPoint({
          date: '2026-10-01',
          functionExecutions: 12,
          functionErrors: 1,
        }),
        buildPoint({ date: '2026-10-02', functionExecutions: 30 }),
      ],
      seriesDefinitions: [
        { key: 'executions', label: 'Executions', field: 'functionExecutions' },
        { key: 'errors', label: 'Errors', field: 'functionErrors' },
      ],
    });

    expect(series).toEqual([
      {
        key: 'executions',
        label: 'Executions',
        data: [
          { x: 'Oct 1', y: 12 },
          { x: 'Oct 2', y: 30 },
        ],
      },
      {
        key: 'errors',
        label: 'Errors',
        data: [
          { x: 'Oct 1', y: 1 },
          { x: 'Oct 2', y: 0 },
        ],
      },
    ]);
  });

  it('should return empty series for an empty period', () => {
    expect(
      buildApplicationRegistrationAnalyticsLineSeries({
        timeSeries: [],
        seriesDefinitions: [
          { key: 'credits', label: 'Credits', field: 'creditsCharged' },
        ],
      }),
    ).toEqual([{ key: 'credits', label: 'Credits', data: [] }]);
  });
});
