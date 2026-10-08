import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ConfigureTimelineActivityRoutingCommand } from 'src/database/commands/upgrade-version-command/2-34/2-34-workspace-command-1787471608317-configure-timeline-activity-routing.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '00000000-0000-4000-8000-000000000001';
const STANDARD_APPLICATION_ID = '00000000-0000-4000-8000-000000000002';
const getOrRecomputeWithTimelineActivity = () =>
  jest.fn().mockResolvedValue({
    flatObjectMetadataMaps: {
      byUniversalIdentifier: {
        [STANDARD_OBJECTS.timelineActivity.universalIdentifier]: {},
      },
    },
  });
const createTransactionalDataSource = (query: ReturnType<typeof jest.fn>) => {
  const queryRunner = {
    isTransactionActive: true,
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
  };

  return {
    dataSource: {
      query,
      createQueryRunner: jest.fn(() => queryRunner),
    } as never,
    queryRunner,
  };
};

describe('ConfigureTimelineActivityRoutingCommand', () => {
  it('backfills standard types and participant junctions into the generic contract', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([[], 8])
      .mockResolvedValueOnce([[], 2]);
    const { dataSource, queryRunner } = createTransactionalDataSource(query);
    const invalidateAndRecompute = jest.fn().mockResolvedValue(undefined);
    const command = new ConfigureTimelineActivityRoutingCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
          .fn()
          .mockResolvedValue({
            twentyStandardFlatApplication: { id: STANDARD_APPLICATION_ID },
          }),
      } as unknown as ApplicationService,
      {
        getOrRecompute: getOrRecomputeWithTimelineActivity(),
        invalidateAndRecompute,
      } as unknown as WorkspaceCacheService,
    );

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      dataSource,
      options: {},
      index: 0,
      total: 1,
    });

    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0][0]).toContain(
      '"targetRelationFieldUniversalIdentifier"',
    );
    expect(query.mock.calls[0][0]).toContain(
      '"triggerFieldUniversalIdentifiers"',
    );
    expect(query.mock.calls[0][0]).toContain(
      'timeline_activity_type."applicationId" = $2',
    );
    expect(query.mock.calls[0][1]).toEqual(
      expect.arrayContaining([
        WORKSPACE_ID,
        STANDARD_APPLICATION_ID,
        STANDARD_OBJECTS.note.fields.noteTargets.universalIdentifier,
        STANDARD_OBJECTS.message.fields.messageParticipants.universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.fields.calendarEventParticipants
          .universalIdentifier,
      ]),
    );
    expect(query.mock.calls[0][1]).toContainEqual([
      STANDARD_OBJECTS.note.fields.title.universalIdentifier,
    ]);
    expect(query.mock.calls[1][0]).toContain('junctionTargetFieldId');
    expect(query.mock.calls[1][1]).toEqual(
      expect.arrayContaining([
        STANDARD_OBJECTS.messageParticipant.fields.person.universalIdentifier,
        STANDARD_OBJECTS.calendarEventParticipant.fields.person
          .universalIdentifier,
      ]),
    );
    expect(invalidateAndRecompute).toHaveBeenCalledWith(WORKSPACE_ID, [
      'flatTimelineActivityTypeMaps',
      'flatFieldMetadataMaps',
    ]);
    expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('does not block the fleet when optional standard metadata is missing', async () => {
    const invalidateAndRecompute = jest.fn().mockResolvedValue(undefined);
    const { dataSource } = createTransactionalDataSource(
      jest.fn().mockResolvedValueOnce([[], 7]).mockResolvedValueOnce([[], 2]),
    );
    const command = new ConfigureTimelineActivityRoutingCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
          .fn()
          .mockResolvedValue({
            twentyStandardFlatApplication: { id: STANDARD_APPLICATION_ID },
          }),
      } as unknown as ApplicationService,
      {
        getOrRecompute: getOrRecomputeWithTimelineActivity(),
        invalidateAndRecompute,
      } as unknown as WorkspaceCacheService,
    );

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      dataSource,
      options: {},
      index: 0,
      total: 1,
    });
    expect(invalidateAndRecompute).toHaveBeenCalledTimes(1);
  });

  it('rolls back both routing updates when the junction update fails', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([[], 8])
      .mockRejectedValueOnce(new Error('junction update failed'));
    const { dataSource, queryRunner } = createTransactionalDataSource(query);
    const invalidateAndRecompute = jest.fn();
    const command = new ConfigureTimelineActivityRoutingCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
          .fn()
          .mockResolvedValue({
            twentyStandardFlatApplication: { id: STANDARD_APPLICATION_ID },
          }),
      } as unknown as ApplicationService,
      {
        getOrRecompute: getOrRecomputeWithTimelineActivity(),
        invalidateAndRecompute,
      } as unknown as WorkspaceCacheService,
    );

    await expect(
      command.runOnWorkspace({
        workspaceId: WORKSPACE_ID,
        dataSource,
        options: {},
        index: 0,
        total: 1,
      }),
    ).rejects.toThrow('junction update failed');

    expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
    expect(invalidateAndRecompute).not.toHaveBeenCalled();
  });

  it('skips workspaces without timeline metadata', async () => {
    const query = jest.fn();
    const findStandardApplication = jest.fn();
    const command = new ConfigureTimelineActivityRoutingCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow:
          findStandardApplication,
      } as unknown as ApplicationService,
      {
        getOrRecompute: jest.fn().mockResolvedValue({
          flatObjectMetadataMaps: { byUniversalIdentifier: {} },
        }),
      } as unknown as WorkspaceCacheService,
    );

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      dataSource: { query } as never,
      options: {},
      index: 0,
      total: 1,
    });

    expect(query).not.toHaveBeenCalled();
    expect(findStandardApplication).not.toHaveBeenCalled();
  });
});
