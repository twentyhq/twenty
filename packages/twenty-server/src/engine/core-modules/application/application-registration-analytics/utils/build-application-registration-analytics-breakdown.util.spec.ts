import { buildApplicationRegistrationAnalyticsBreakdown } from 'src/engine/core-modules/application/application-registration-analytics/utils/build-application-registration-analytics-breakdown.util';

const buildCell = ({
  metric,
  dimension = '',
  context = '',
  value,
}: {
  metric: string;
  dimension?: string;
  context?: string;
  value: string | number;
}) => ({ metric, dimension, context, value });

describe('buildApplicationRegistrationAnalyticsBreakdown', () => {
  it('should sum the cells of the requested metrics per key and sort them descending', () => {
    expect(
      buildApplicationRegistrationAnalyticsBreakdown({
        rows: [
          buildCell({
            metric: 'function.error',
            dimension: 'TIMEOUT',
            context: 'syncContacts',
            value: 2,
          }),
          buildCell({
            metric: 'function.error',
            dimension: 'TIMEOUT',
            context: 'nightlySync',
            value: '5',
          }),
          buildCell({
            metric: 'function.error',
            dimension: 'THROWN',
            context: 'syncContacts',
            value: 9,
          }),
          buildCell({
            metric: 'function.execution',
            dimension: 'syncContacts',
            value: 40,
          }),
        ],
        metrics: ['function.error'],
        groupBy: 'dimension',
      }),
    ).toEqual([
      { key: 'THROWN', value: 9 },
      { key: 'TIMEOUT', value: 7 },
    ]);
  });

  it('should group the same cells by context', () => {
    expect(
      buildApplicationRegistrationAnalyticsBreakdown({
        rows: [
          buildCell({
            metric: 'function.error',
            dimension: 'TIMEOUT',
            context: 'syncContacts',
            value: 2,
          }),
          buildCell({
            metric: 'function.error',
            dimension: 'THROWN',
            context: 'syncContacts',
            value: 9,
          }),
          buildCell({
            metric: 'function.error',
            dimension: 'TIMEOUT',
            context: 'nightlySync',
            value: 5,
          }),
        ],
        metrics: ['function.error'],
        groupBy: 'context',
      }),
    ).toEqual([
      { key: 'syncContacts', value: 11 },
      { key: 'nightlySync', value: 5 },
    ]);
  });

  it('should ignore cells without a key', () => {
    expect(
      buildApplicationRegistrationAnalyticsBreakdown({
        rows: [
          buildCell({ metric: 'install.failed', value: 3 }),
          buildCell({
            metric: 'install.failed',
            dimension: 'APPLICATION_NOT_FOUND',
            value: 1,
          }),
        ],
        metrics: ['install.failed', 'upgrade.failed', 'uninstall.failed'],
        groupBy: 'dimension',
      }),
    ).toEqual([{ key: 'APPLICATION_NOT_FOUND', value: 1 }]);
  });

  it('should apply the value conversion after summing', () => {
    expect(
      buildApplicationRegistrationAnalyticsBreakdown({
        rows: [
          buildCell({
            metric: 'charge.credits_micro',
            dimension: 'enrich',
            value: 1_000_000,
          }),
          buildCell({
            metric: 'charge.credits_micro',
            dimension: 'enrich',
            value: 500_000,
          }),
        ],
        metrics: ['charge.credits_micro'],
        groupBy: 'dimension',
        convertValue: (value) => value / 1_000_000,
      }),
    ).toEqual([{ key: 'enrich', value: 1.5 }]);
  });
});
