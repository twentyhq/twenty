import { type ApplicationRegistrationMetricCellRow } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-metric-cell-row.type';
import { buildApplicationRegistrationAnalyticsVersions } from 'src/engine/core-modules/application/application-registration-analytics/utils/build-application-registration-analytics-versions.util';

const buildCell = (
  cell: Pick<ApplicationRegistrationMetricCellRow, 'version' | 'metric'> &
    Partial<ApplicationRegistrationMetricCellRow>,
): ApplicationRegistrationMetricCellRow => ({
  date: '2026-10-01',
  dimension: '',
  context: '',
  value: 1,
  ...cell,
});

describe('buildApplicationRegistrationAnalyticsVersions', () => {
  const periodStart = new Date('2026-10-01T00:00:00.000Z');
  const periodEnd = new Date('2026-10-03T00:00:00.000Z');

  it('should list versions newest first with their own counts and workspaces', () => {
    const versions = buildApplicationRegistrationAnalyticsVersions({
      cells: [
        buildCell({ version: '1.9.0', metric: 'function.execution', value: 4 }),
        buildCell({
          version: '1.10.0',
          metric: 'function.execution',
          value: 7,
        }),
        buildCell({ version: '1.10.0', metric: 'function.error', value: 2 }),
        buildCell({ version: '1.10.0', metric: 'upgrade.succeeded' }),
      ],
      activeWorkspacesByVersion: [
        { version: '1.9.0', activeWorkspaces: '3' },
        { version: '1.10.0', activeWorkspaces: 1 },
      ],
      dailyActiveWorkspacesByVersion: [],
      periodStart,
      periodEnd,
    });

    expect(versions.map(({ version }) => version)).toEqual(['1.10.0', '1.9.0']);
    expect(versions[0]).toMatchObject({
      activeWorkspaces: 1,
      functionExecutions: 7,
      functionErrors: 2,
      upgradeSucceeded: 1,
    });
    expect(versions[1]).toMatchObject({
      activeWorkspaces: 3,
      functionExecutions: 4,
      functionErrors: 0,
    });
  });

  it('should give each version one adoption point per day of the period', () => {
    const [version] = buildApplicationRegistrationAnalyticsVersions({
      cells: [buildCell({ version: '2.0.0', metric: 'install.succeeded' })],
      activeWorkspacesByVersion: [{ version: '2.0.0', activeWorkspaces: 2 }],
      dailyActiveWorkspacesByVersion: [
        { date: '2026-10-02', version: '2.0.0', activeWorkspaces: '2' },
      ],
      periodStart,
      periodEnd,
    });

    expect(version.timeSeries).toEqual([
      { date: '2026-10-01', activeWorkspaces: 0 },
      { date: '2026-10-02', activeWorkspaces: 2 },
    ]);
  });

  it('should list a published version that no workspace runs yet', () => {
    const versions = buildApplicationRegistrationAnalyticsVersions({
      cells: [buildCell({ version: '3.0.0', metric: 'version.published' })],
      activeWorkspacesByVersion: [],
      dailyActiveWorkspacesByVersion: [],
      periodStart,
      periodEnd,
    });

    expect(versions).toHaveLength(1);
    expect(versions[0]).toMatchObject({
      version: '3.0.0',
      activeWorkspaces: 0,
    });
  });

  it('should rank versions that are not semver after semver ones and skip missing versions', () => {
    const versions = buildApplicationRegistrationAnalyticsVersions({
      cells: [
        buildCell({ version: 'unknown', metric: 'install.failed' }),
        buildCell({ version: '', metric: 'api.rate_limited' }),
        buildCell({ version: '0.1.0', metric: 'install.succeeded' }),
      ],
      activeWorkspacesByVersion: [],
      dailyActiveWorkspacesByVersion: [],
      periodStart,
      periodEnd,
    });

    expect(versions.map(({ version }) => version)).toEqual([
      '0.1.0',
      'unknown',
    ]);
  });

  it('should keep only the most recent versions', () => {
    const versions = buildApplicationRegistrationAnalyticsVersions({
      cells: Array.from({ length: 12 }, (_, index) =>
        buildCell({ version: `1.${index}.0`, metric: 'install.succeeded' }),
      ),
      activeWorkspacesByVersion: [],
      dailyActiveWorkspacesByVersion: [],
      periodStart,
      periodEnd,
    });

    expect(versions).toHaveLength(10);
    expect(versions[0].version).toBe('1.11.0');
    expect(versions[9].version).toBe('1.2.0');
  });
});
