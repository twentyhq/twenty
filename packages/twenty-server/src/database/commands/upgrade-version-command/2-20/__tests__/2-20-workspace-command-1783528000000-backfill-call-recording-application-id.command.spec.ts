import { FieldActorSource } from 'twenty-shared/types';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { BackfillCallRecordingApplicationIdCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783528000000-backfill-call-recording-application-id.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

jest.mock('src/engine/utils/compute-object-target-table.util');
jest.mock('src/engine/workspace-datasource/utils/get-workspace-schema-name.util');

const computeObjectTargetTableMock = computeObjectTargetTable as jest.Mock;
const getWorkspaceSchemaNameMock = getWorkspaceSchemaName as jest.Mock;

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const SCHEMA_NAME = 'workspace_test';

const CALL_RECORDER = {
  id: '20202020-0000-0000-0000-0000000000a1',
  name: 'Call Recorder',
  universalIdentifier: '8da4b8b5-5edf-4880-b51f-ab6e679ec617',
};
const FIREFLIES = {
  id: '20202020-0000-0000-0000-0000000000a2',
  name: 'Twenty Fireflies',
  universalIdentifier: '97d24431-ebc7-4156-9705-b6900e73edc8',
};

describe('BackfillCallRecordingApplicationIdCommand', () => {
  let command: BackfillCallRecordingApplicationIdCommand;
  let findManyInstalledFlatApplicationsMock: jest.Mock;
  let getOrRecomputeMock: jest.Mock;
  let queryMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    computeObjectTargetTableMock.mockReturnValue('callRecording');
    getWorkspaceSchemaNameMock.mockReturnValue(SCHEMA_NAME);

    findManyInstalledFlatApplicationsMock = jest
      .fn()
      .mockResolvedValue([CALL_RECORDER, FIREFLIES]);
    getOrRecomputeMock = jest.fn().mockResolvedValue({
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {
          'call-recording-object': {
            nameSingular: 'callRecording',
            applicationUniversalIdentifier: 'twenty-standard',
          },
        },
      },
    });
    queryMock = jest.fn().mockResolvedValue([[], 2]);

    command = new BackfillCallRecordingApplicationIdCommand(
      {} as WorkspaceIteratorService,
      {
        findManyInstalledFlatApplications:
          findManyInstalledFlatApplicationsMock,
      } as unknown as ApplicationService,
      {
        getOrRecompute: getOrRecomputeMock,
      } as unknown as WorkspaceCacheService,
    );
  });

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      dataSource: { query: queryMock } as never,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  it('stamps each installed app universal identifier onto its own null-applicationId recordings', async () => {
    await runOnWorkspace();

    expect(queryMock).toHaveBeenCalledTimes(2);

    const expectedSql = `UPDATE "${SCHEMA_NAME}"."callRecording"
         SET "applicationId" = $1
         WHERE "applicationId" IS NULL
           AND "createdBySource" = $2
           AND "createdByName" = $3`;

    expect(queryMock).toHaveBeenNthCalledWith(
      1,
      expectedSql,
      [
        CALL_RECORDER.universalIdentifier,
        FieldActorSource.APPLICATION,
        CALL_RECORDER.name,
      ],
      undefined,
      { shouldBypassPermissionChecks: true },
    );
    expect(queryMock).toHaveBeenNthCalledWith(
      2,
      expectedSql,
      [
        FIREFLIES.universalIdentifier,
        FieldActorSource.APPLICATION,
        FIREFLIES.name,
      ],
      undefined,
      { shouldBypassPermissionChecks: true },
    );
  });

  it('does not write in dry-run mode', async () => {
    await runOnWorkspace(true);

    expect(queryMock).not.toHaveBeenCalled();
  });

  it('skips workspaces without a data source', async () => {
    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      dataSource: undefined,
      options: { dryRun: false },
      index: 0,
      total: 1,
    });

    expect(getOrRecomputeMock).not.toHaveBeenCalled();
    expect(findManyInstalledFlatApplicationsMock).not.toHaveBeenCalled();
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('skips workspaces where the callRecording object is absent', async () => {
    getOrRecomputeMock.mockResolvedValue({
      flatObjectMetadataMaps: { byUniversalIdentifier: {} },
    });

    await runOnWorkspace();

    expect(findManyInstalledFlatApplicationsMock).not.toHaveBeenCalled();
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('does nothing when no applications are installed', async () => {
    findManyInstalledFlatApplicationsMock.mockResolvedValue([]);

    await runOnWorkspace();

    expect(queryMock).not.toHaveBeenCalled();
  });
});
