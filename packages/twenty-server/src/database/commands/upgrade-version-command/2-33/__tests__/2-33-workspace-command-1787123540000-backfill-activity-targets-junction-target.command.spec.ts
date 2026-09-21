import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { BackfillActivityTargetsJunctionTargetCommand } from 'src/database/commands/upgrade-version-command/2-33/2-33-workspace-command-1787123540000-backfill-activity-targets-junction-target.command';
import { invalidateFieldMetadataCache } from 'src/database/commands/upgrade-version-command/utils/invalidate-field-metadata-cache.util';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

jest.mock(
  'src/database/commands/upgrade-version-command/utils/invalidate-field-metadata-cache.util',
);

const invalidateFieldMetadataCacheMock = jest.mocked(
  invalidateFieldMetadataCache,
);

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const NOTE_TARGET_OBJECT_METADATA_ID =
  '20202020-0000-0000-0000-000000000002';
const TASK_TARGET_OBJECT_METADATA_ID =
  '20202020-0000-0000-0000-000000000003';
const NOTE_TARGETS_FIELD_METADATA_ID =
  '20202020-0000-0000-0000-000000000004';
const TASK_TARGETS_FIELD_METADATA_ID =
  '20202020-0000-0000-0000-000000000005';
const LEGACY_NOTE_TARGET_PERSON_FIELD_METADATA_ID =
  '20202020-0000-0000-0000-000000000006';
const LEGACY_TASK_TARGET_PERSON_FIELD_METADATA_ID =
  '20202020-0000-0000-0000-000000000007';
const LEGACY_NOTE_TARGET_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-38ca-4aab-92f5-8a605ca2e4c5';
const LEGACY_TASK_TARGET_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-c8a0-4e85-a016-87e2349cfbec';

const buildFlatFieldMetadata = (
  overrides: Partial<FlatFieldMetadata>,
): FlatFieldMetadata =>
  ({
    id: '20202020-0000-0000-0000-000000000099',
    universalIdentifier: '20202020-0000-0000-0000-000000000098',
    type: FieldMetadataType.TEXT,
    settings: null,
    ...overrides,
  }) as FlatFieldMetadata;

const buildFlatFieldMetadataMaps = (
  flatFieldMetadatas: FlatFieldMetadata[],
): FlatEntityMaps<FlatFieldMetadata> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.universalIdentifier,
      flatFieldMetadata,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.id,
      flatFieldMetadata.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

const NOTE_TARGETS_FLAT_FIELD_METADATA = buildFlatFieldMetadata({
  id: NOTE_TARGETS_FIELD_METADATA_ID,
  universalIdentifier:
    STANDARD_OBJECTS.note.fields.noteTargets.universalIdentifier,
  type: FieldMetadataType.RELATION,
  relationTargetObjectMetadataId: NOTE_TARGET_OBJECT_METADATA_ID,
  settings: { relationType: RelationType.ONE_TO_MANY },
});

const TASK_TARGETS_FLAT_FIELD_METADATA = buildFlatFieldMetadata({
  id: TASK_TARGETS_FIELD_METADATA_ID,
  universalIdentifier:
    STANDARD_OBJECTS.task.fields.taskTargets.universalIdentifier,
  type: FieldMetadataType.RELATION,
  relationTargetObjectMetadataId: TASK_TARGET_OBJECT_METADATA_ID,
  settings: { relationType: RelationType.ONE_TO_MANY },
});

const LEGACY_NOTE_TARGET_PERSON_FLAT_FIELD_METADATA = buildFlatFieldMetadata({
  id: LEGACY_NOTE_TARGET_PERSON_FIELD_METADATA_ID,
  universalIdentifier: LEGACY_NOTE_TARGET_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectMetadataId: NOTE_TARGET_OBJECT_METADATA_ID,
  type: FieldMetadataType.RELATION,
  settings: { relationType: RelationType.MANY_TO_ONE },
});

const LEGACY_TASK_TARGET_PERSON_FLAT_FIELD_METADATA = buildFlatFieldMetadata({
  id: LEGACY_TASK_TARGET_PERSON_FIELD_METADATA_ID,
  universalIdentifier: LEGACY_TASK_TARGET_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectMetadataId: TASK_TARGET_OBJECT_METADATA_ID,
  type: FieldMetadataType.RELATION,
  settings: { relationType: RelationType.MANY_TO_ONE },
});

describe('BackfillActivityTargetsJunctionTargetCommand', () => {
  let command: BackfillActivityTargetsJunctionTargetCommand;
  let findOneMock: jest.Mock;
  let updateMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    findOneMock = jest
      .fn()
      .mockResolvedValueOnce({
        settings: { relationType: RelationType.ONE_TO_MANY },
      })
      .mockResolvedValueOnce({
        settings: { relationType: RelationType.ONE_TO_MANY },
      });
    updateMock = jest.fn();

    const transactionalRepository = {
      findOne: findOneMock,
      update: updateMock,
    };
    const fieldMetadataRepository = {
      manager: {
        transaction: jest.fn(
          async (
            callback: (entityManager: {
              getRepository: () => typeof transactionalRepository;
            }) => Promise<string[]>,
          ) =>
            callback({
              getRepository: () => transactionalRepository,
            }),
        ),
      },
    } as unknown as Repository<FieldMetadataEntity>;

    command = new BackfillActivityTargetsJunctionTargetCommand(
      {} as WorkspaceIteratorService,
      {
        getOrRecompute: jest.fn().mockResolvedValue({
          flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
            NOTE_TARGETS_FLAT_FIELD_METADATA,
            TASK_TARGETS_FLAT_FIELD_METADATA,
            LEGACY_NOTE_TARGET_PERSON_FLAT_FIELD_METADATA,
            LEGACY_TASK_TARGET_PERSON_FLAT_FIELD_METADATA,
          ]),
        }),
      } as unknown as WorkspaceCacheService,
      {} as WorkspaceMigrationRunnerService,
      fieldMetadataRepository,
    );
  });

  it('backfills legacy note and task target person relation identifiers', async () => {
    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
    });

    expect(updateMock).toHaveBeenNthCalledWith(
      1,
      { id: NOTE_TARGETS_FIELD_METADATA_ID, workspaceId: WORKSPACE_ID },
      {
        settings: {
          relationType: RelationType.ONE_TO_MANY,
          junctionTargetFieldId: LEGACY_NOTE_TARGET_PERSON_FIELD_METADATA_ID,
        },
      },
    );
    expect(updateMock).toHaveBeenNthCalledWith(
      2,
      { id: TASK_TARGETS_FIELD_METADATA_ID, workspaceId: WORKSPACE_ID },
      {
        settings: {
          relationType: RelationType.ONE_TO_MANY,
          junctionTargetFieldId: LEGACY_TASK_TARGET_PERSON_FIELD_METADATA_ID,
        },
      },
    );
    expect(invalidateFieldMetadataCacheMock).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      workspaceMigrationRunnerService: expect.anything(),
    });
  });
});
