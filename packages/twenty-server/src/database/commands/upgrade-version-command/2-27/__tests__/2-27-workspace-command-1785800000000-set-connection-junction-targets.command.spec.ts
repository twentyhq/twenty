import { RelationType } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { SetConnectionJunctionTargetsCommand } from 'src/database/commands/upgrade-version-command/2-27/2-27-workspace-command-1785800000000-set-connection-junction-targets.command';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';

const PERSON_OBJECT_ID = '20202020-0000-0000-0000-0000000000a1';
const CONNECTION_OBJECT_ID = '20202020-0000-0000-0000-0000000000a2';

const PERSON_CONNECTIONS_FIELD_ID = '20202020-0000-0000-0000-0000000000b1';
const PERSON_CONNECTED_FROM_FIELD_ID = '20202020-0000-0000-0000-0000000000b2';
const CONNECTION_PERSON_FIELD_ID = '20202020-0000-0000-0000-0000000000b3';
const CONNECTION_CONNECTED_TO_FIELD_ID = '20202020-0000-0000-0000-0000000000b4';

const buildMaps = <T extends { id: string }>(entities: T[]) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.id, entity]),
  ),
});

const buildWorkspaceCache = ({
  withConnectionObject = true,
  personConnectionsSettings = { relationType: RelationType.ONE_TO_MANY },
}: {
  withConnectionObject?: boolean;
  personConnectionsSettings?: Record<string, unknown>;
} = {}) => ({
  flatObjectMetadataMaps: buildMaps([
    { id: PERSON_OBJECT_ID, nameSingular: 'person' },
    ...(withConnectionObject
      ? [{ id: CONNECTION_OBJECT_ID, nameSingular: 'connection' }]
      : []),
  ]),
  flatFieldMetadataMaps: buildMaps([
    {
      id: PERSON_CONNECTIONS_FIELD_ID,
      name: 'connections',
      objectMetadataId: PERSON_OBJECT_ID,
      settings: personConnectionsSettings,
    },
    {
      id: PERSON_CONNECTED_FROM_FIELD_ID,
      name: 'connectedFrom',
      objectMetadataId: PERSON_OBJECT_ID,
      settings: { relationType: RelationType.ONE_TO_MANY },
    },
    {
      id: CONNECTION_PERSON_FIELD_ID,
      name: 'person',
      objectMetadataId: CONNECTION_OBJECT_ID,
      settings: { relationType: RelationType.MANY_TO_ONE },
    },
    {
      id: CONNECTION_CONNECTED_TO_FIELD_ID,
      name: 'connectedTo',
      objectMetadataId: CONNECTION_OBJECT_ID,
      settings: { relationType: RelationType.MANY_TO_ONE },
    },
  ]),
});

describe('SetConnectionJunctionTargetsCommand', () => {
  let command: SetConnectionJunctionTargetsCommand;
  let getOrRecomputeMock: jest.Mock;
  let updateMock: jest.Mock;
  let invalidateCacheMock: jest.Mock;

  const buildCommand = (workspaceCache: unknown) => {
    getOrRecomputeMock = jest.fn().mockResolvedValue(workspaceCache);
    updateMock = jest.fn().mockResolvedValue(undefined);
    invalidateCacheMock = jest.fn().mockResolvedValue(undefined);

    return new SetConnectionJunctionTargetsCommand(
      {} as WorkspaceIteratorService,
      {
        getOrRecompute: getOrRecomputeMock,
      } as unknown as WorkspaceCacheService,
      {
        invalidateCache: invalidateCacheMock,
      } as unknown as WorkspaceMigrationRunnerService,
      {
        update: updateMock,
      } as unknown as Repository<FieldMetadataEntity>,
    );
  };

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  it('points each person side at the opposite connection field', async () => {
    command = buildCommand(buildWorkspaceCache());

    await runOnWorkspace();

    expect(updateMock).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenCalledWith(
      { id: PERSON_CONNECTIONS_FIELD_ID, workspaceId: WORKSPACE_ID },
      {
        settings: {
          relationType: RelationType.ONE_TO_MANY,
          junctionTargetFieldId: CONNECTION_CONNECTED_TO_FIELD_ID,
        },
      },
    );
    expect(updateMock).toHaveBeenCalledWith(
      { id: PERSON_CONNECTED_FROM_FIELD_ID, workspaceId: WORKSPACE_ID },
      {
        settings: {
          relationType: RelationType.ONE_TO_MANY,
          junctionTargetFieldId: CONNECTION_PERSON_FIELD_ID,
        },
      },
    );
    expect(invalidateCacheMock).toHaveBeenCalledTimes(1);
  });

  it('skips workspaces without a connection object', async () => {
    command = buildCommand(
      buildWorkspaceCache({ withConnectionObject: false }),
    );

    await runOnWorkspace();

    expect(updateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });

  it('leaves an already configured junction target alone', async () => {
    command = buildCommand(
      buildWorkspaceCache({
        personConnectionsSettings: {
          relationType: RelationType.ONE_TO_MANY,
          junctionTargetFieldId: CONNECTION_CONNECTED_TO_FIELD_ID,
        },
      }),
    );

    await runOnWorkspace();

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith(
      { id: PERSON_CONNECTED_FROM_FIELD_ID, workspaceId: WORKSPACE_ID },
      expect.anything(),
    );
  });

  it('writes nothing on a dry run', async () => {
    command = buildCommand(buildWorkspaceCache());

    await runOnWorkspace(true);

    expect(updateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });
});
