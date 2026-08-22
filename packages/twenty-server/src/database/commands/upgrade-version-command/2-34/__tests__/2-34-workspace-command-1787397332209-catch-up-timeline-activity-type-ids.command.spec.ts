import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { CatchUpTimelineActivityTypeIdsCommand } from 'src/database/commands/upgrade-version-command/2-34/2-34-workspace-command-1787397332209-catch-up-timeline-activity-type-ids.command';
import { type GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const TIMELINE_ACTIVITY_TYPE_ID = '20202020-0000-0000-0000-000000000002';

const buildCache = ({
  hasTimelineActivityObject = true,
  hasTimelineActivityTypeIdField = true,
}: {
  hasTimelineActivityObject?: boolean;
  hasTimelineActivityTypeIdField?: boolean;
} = {}) => ({
  flatObjectMetadataMaps: {
    byUniversalIdentifier: hasTimelineActivityObject
      ? {
          [STANDARD_OBJECTS.timelineActivity.universalIdentifier]: {
            id: 'timeline-activity-object-id',
            universalIdentifier:
              STANDARD_OBJECTS.timelineActivity.universalIdentifier,
          },
        }
      : {},
  },
  flatFieldMetadataMaps: {
    byUniversalIdentifier: hasTimelineActivityTypeIdField
      ? {
          [STANDARD_OBJECTS.timelineActivity.fields.timelineActivityTypeId
            .universalIdentifier]: {
            id: 'timeline-activity-type-id-field-id',
            universalIdentifier:
              STANDARD_OBJECTS.timelineActivity.fields.timelineActivityTypeId
                .universalIdentifier,
          },
        }
      : {},
  },
  flatTimelineActivityTypeMaps: {
    byUniversalIdentifier: {
      '20202020-0000-0000-0000-000000000003': {
        id: TIMELINE_ACTIVITY_TYPE_ID,
        action: 'linked',
        objectUniversalIdentifier: null,
      },
    },
  },
});

describe('CatchUpTimelineActivityTypeIdsCommand', () => {
  let command: CatchUpTimelineActivityTypeIdsCommand;
  let getOrRecomputeMock: jest.Mock;
  let queryMock: jest.Mock;
  let dataSource: GlobalWorkspaceDataSource;

  beforeEach(() => {
    jest.clearAllMocks();

    getOrRecomputeMock = jest.fn().mockResolvedValue(buildCache());
    queryMock = jest.fn();
    dataSource = {
      query: queryMock,
    } as unknown as GlobalWorkspaceDataSource;

    command = new CatchUpTimelineActivityTypeIdsCommand(
      {} as WorkspaceIteratorService,
      {
        getOrRecompute: getOrRecomputeMock,
      } as unknown as WorkspaceCacheService,
    );
  });

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      dataSource,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  it('backfills every rollout row in bounded batches and reports dangling references', async () => {
    queryMock
      .mockResolvedValueOnce([
        { nullTypeIdCount: 6000, danglingTypeIdCount: 1 },
      ])
      .mockResolvedValueOnce([[], 5000])
      .mockResolvedValueOnce([[], 1000])
      .mockResolvedValueOnce([{ nullTypeIdCount: 0, danglingTypeIdCount: 1 }]);
    const warnSpy = jest
      .spyOn(command['logger'], 'warn')
      .mockImplementation(() => undefined);

    await runOnWorkspace();

    expect(queryMock).toHaveBeenCalledTimes(4);
    expect(queryMock.mock.calls[1][0]).toContain(
      'UPDATE "workspace_1wgvd1ht596lnc3xc7ykpvqbl"."timelineActivity"',
    );
    expect(queryMock.mock.calls[2][0]).toContain(
      'WHERE "timelineActivityTypeId" IS NULL LIMIT 5000',
    );
    expect(warnSpy).toHaveBeenCalledWith(
      `Workspace ${WORKSPACE_ID} still has 0 timelineActivity row(s) without a type and 1 dangling type reference(s)`,
    );
  });

  it('audits without changing rows in dry-run mode', async () => {
    queryMock.mockResolvedValueOnce([
      { nullTypeIdCount: 3, danglingTypeIdCount: 2 },
    ]);
    const logSpy = jest
      .spyOn(command['logger'], 'log')
      .mockImplementation(() => undefined);

    await runOnWorkspace(true);

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('COUNT(*) FILTER'),
      [[TIMELINE_ACTIVITY_TYPE_ID]],
      undefined,
      { shouldBypassPermissionChecks: true },
    );
    expect(logSpy).toHaveBeenCalledWith(
      `[DRY RUN] Would backfill 3 timelineActivity row(s); found 2 dangling type reference(s) for workspace ${WORKSPACE_ID}`,
    );
  });

  it('does not run an update when every row already has a valid type', async () => {
    queryMock.mockResolvedValue([
      { nullTypeIdCount: 0, danglingTypeIdCount: 0 },
    ]);
    const logSpy = jest
      .spyOn(command['logger'], 'log')
      .mockImplementation(() => undefined);

    await runOnWorkspace();

    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(
      queryMock.mock.calls.some(([query]) => query.startsWith('UPDATE')),
    ).toBe(false);
    expect(logSpy).toHaveBeenCalledWith(
      `All timelineActivity rows have valid type references for workspace ${WORKSPACE_ID}`,
    );
  });

  it('fails before querying when the 2.33 type field is missing', async () => {
    getOrRecomputeMock.mockResolvedValue(
      buildCache({ hasTimelineActivityTypeIdField: false }),
    );

    await expect(runOnWorkspace()).rejects.toThrow(
      `Workspace ${WORKSPACE_ID} is missing timelineActivity.timelineActivityTypeId after the 2.33 upgrade`,
    );
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('skips workspaces where timelineActivity was never provisioned', async () => {
    getOrRecomputeMock.mockResolvedValue(
      buildCache({ hasTimelineActivityObject: false }),
    );

    await runOnWorkspace();

    expect(queryMock).not.toHaveBeenCalled();
  });
});
