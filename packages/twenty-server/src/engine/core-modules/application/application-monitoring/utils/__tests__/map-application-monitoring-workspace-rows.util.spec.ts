import { mapApplicationMonitoringWorkspaceRows } from 'src/engine/core-modules/application/application-monitoring/utils/map-application-monitoring-workspace-rows.util';

describe('mapApplicationMonitoringWorkspaceRows', () => {
  it('names each workspace and converts ClickHouse values', () => {
    expect(
      mapApplicationMonitoringWorkspaceRows({
        rows: [
          {
            workspaceId: 'workspace-1',
            applicationVersion: '1.2.3',
            runCount: '1240',
            failedRunCount: '49',
            rateLimitEventCount: '0',
            lastEventAt: '2026-10-19 08:41:12.204',
          },
          {
            workspaceId: 'deleted-workspace',
            applicationVersion: '1.2.2',
            runCount: 3,
            failedRunCount: 0,
            rateLimitEventCount: 1,
            lastEventAt: '2026-10-01 10:00:00',
          },
        ],
        workspaceNameById: new Map([['workspace-1', 'Acme Corp']]),
      }),
    ).toEqual([
      {
        workspaceId: 'workspace-1',
        workspaceName: 'Acme Corp',
        applicationVersion: '1.2.3',
        runCount: 1240,
        failedRunCount: 49,
        rateLimitEventCount: 0,
        lastEventAt: new Date('2026-10-19T08:41:12.204Z'),
      },
      {
        workspaceId: 'deleted-workspace',
        workspaceName: null,
        applicationVersion: '1.2.2',
        runCount: 3,
        failedRunCount: 0,
        rateLimitEventCount: 1,
        lastEventAt: new Date('2026-10-01T10:00:00.000Z'),
      },
    ]);
  });
});
