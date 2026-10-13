import { filterApplicationRegistrationMetricRowsByWorkspaceCount } from 'src/engine/core-modules/application/application-registration-analytics/utils/filter-application-registration-metric-rows-by-workspace-count.util';

describe('filterApplicationRegistrationMetricRowsByWorkspaceCount', () => {
  it('should withhold every cell of an app installed in a single workspace', () => {
    const singleInstallRows = [
      {
        date: '2026-10-01',
        metric: 'function.execution',
        value: 40,
        workspaceCount: 1,
      },
      {
        date: '2026-10-01',
        metric: 'function.error',
        value: 3,
        workspaceCount: '1',
      },
      {
        date: '2026-10-02',
        metric: 'charge.credits_micro',
        value: 2500000,
        workspaceCount: 1,
      },
    ];

    expect(
      filterApplicationRegistrationMetricRowsByWorkspaceCount({
        rows: singleInstallRows,
      }),
    ).toEqual([]);
  });

  it('should keep only the cells with enough contributing workspaces', () => {
    const rows = [
      {
        date: '2026-10-01',
        metric: 'function.execution',
        value: 40,
        workspaceCount: 3,
      },
      {
        date: '2026-10-01',
        metric: 'function.error',
        value: 3,
        workspaceCount: 2,
      },
      {
        date: '2026-10-02',
        metric: 'function.execution',
        value: '12',
        workspaceCount: '7',
      },
    ];

    expect(
      filterApplicationRegistrationMetricRowsByWorkspaceCount({ rows }),
    ).toEqual([rows[0], rows[2]]);
  });

  it('should honour an explicit threshold', () => {
    const rows = [{ value: 1, workspaceCount: 2 }];

    expect(
      filterApplicationRegistrationMetricRowsByWorkspaceCount({
        rows,
        minimumWorkspaceCount: 2,
      }),
    ).toEqual(rows);
    expect(
      filterApplicationRegistrationMetricRowsByWorkspaceCount({
        rows,
        minimumWorkspaceCount: 5,
      }),
    ).toEqual([]);
  });
});
