import { buildUsagePeriodClause } from 'src/engine/core-modules/usage/utils/build-usage-period-clause.util';

describe('buildUsagePeriodClause', () => {
  it('matches a billing period on the period stamped on the event', () => {
    const clause = buildUsagePeriodClause('billing');

    expect(clause).toContain('AND periodStart = {periodStart:DateTime64(3)}');
    expect(clause).toContain(
      'AND timestamp >= {periodStart:DateTime64(3)} - INTERVAL 1 DAY',
    );
    expect(clause).toContain(
      'AND timestamp < {periodEnd:DateTime64(3)} + INTERVAL 1 DAY',
    );
  });

  it('matches a calendar period on UTC day buckets', () => {
    const clause = buildUsagePeriodClause('calendar');

    expect(clause).toContain(
      "AND toStartOfDay(timestamp, 'UTC') >= {periodStart:DateTime64(3)}",
    );
    expect(clause).toContain(
      "AND toStartOfDay(timestamp, 'UTC') < {periodEnd:DateTime64(3)}",
    );
    expect(clause).not.toContain('periodStart =');
  });
});
