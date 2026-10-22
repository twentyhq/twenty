import { mapApplicationMonitoringWorkspaceRows } from 'src/engine/core-modules/application/application-monitoring/utils/map-application-monitoring-workspace-rows.util';

describe('mapApplicationMonitoringWorkspaceRows', () => {
  it('names each workspace with its logo and converts ClickHouse values', () => {
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
        workspaces: [
          {
            workspaceId: 'workspace-1',
            workspaceName: 'Acme Corp',
            workspaceLogoUrl: 'https://files.example.com/acme-logo.png',
          },
        ],
      }),
    ).toEqual([
      {
        workspaceId: 'workspace-1',
        workspaceName: 'Acme Corp',
        workspaceLogoUrl: 'https://files.example.com/acme-logo.png',
        applicationVersion: '1.2.3',
        runCount: 1240,
        failedRunCount: 49,
        rateLimitEventCount: 0,
        lastEventAt: new Date('2026-10-19T08:41:12.204Z'),
      },
      {
        workspaceId: 'deleted-workspace',
        workspaceName: null,
        workspaceLogoUrl: null,
        applicationVersion: '1.2.2',
        runCount: 3,
        failedRunCount: 0,
        rateLimitEventCount: 1,
        lastEventAt: new Date('2026-10-01T10:00:00.000Z'),
      },
    ]);
  });
});
