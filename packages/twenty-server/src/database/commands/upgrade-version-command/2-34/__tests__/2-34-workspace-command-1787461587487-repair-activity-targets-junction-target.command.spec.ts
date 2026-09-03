import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { RepairActivityTargetsJunctionTargetCommand } from 'src/database/commands/upgrade-version-command/2-34/2-34-workspace-command-1787461587487-repair-activity-targets-junction-target.command';
import { invalidateFieldMetadataCache } from 'src/database/commands/upgrade-version-command/utils/invalidate-field-metadata-cache.util';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

jest.mock(
  'src/database/commands/upgrade-version-command/utils/invalidate-field-metadata-cache.util',
);

const invalidateFieldMetadataCacheMock = jest.mocked(
  invalidateFieldMetadataCache,
);

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const NOTE_TARGET_OBJECT_METADATA_ID = '20202020-0000-0000-0000-000000000002';
const TASK_TARGET_OBJECT_METADATA_ID = '20202020-0000-0000-0000-000000000003';
const NOTE_TARGETS_FIELD_METADATA_ID = '20202020-0000-0000-0000-000000000004';
const TASK_TARGETS_FIELD_METADATA_ID = '20202020-0000-0000-0000-000000000005';
const CUSTOM_NOTE_TARGET_FIELD_METADATA_ID =
  '20202020-0000-0000-0000-000000000006';
const CUSTOM_TASK_TARGET_FIELD_METADATA_ID =
  '20202020-0000-0000-0000-000000000007';
const LEGACY_NOTE_TARGET_PERSON_FIELD_METADATA_ID =
  '20202020-0000-0000-0000-000000000008';
const LEGACY_NOTE_TARGET_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-38ca-4aab-92f5-8a605ca2e4c5';

const buildFieldMetadata = (
  overrides: Partial<FieldMetadataEntity>,
): FieldMetadataEntity =>
  ({
    id: '20202020-0000-0000-0000-000000000099',
    workspaceId: WORKSPACE_ID,
    universalIdentifier: '20202020-0000-0000-0000-000000000098',
    type: FieldMetadataType.TEXT,
    settings: null,
    isActive: true,
    ...overrides,
  }) as FieldMetadataEntity;

const NOTE_TARGETS_FIELD_METADATA = buildFieldMetadata({
  id: NOTE_TARGETS_FIELD_METADATA_ID,
  universalIdentifier:
    STANDARD_OBJECTS.note.fields.noteTargets.universalIdentifier,
  type: FieldMetadataType.RELATION,
  relationTargetObjectMetadataId: NOTE_TARGET_OBJECT_METADATA_ID,
  settings: { relationType: RelationType.ONE_TO_MANY },
});

const TASK_TARGETS_FIELD_METADATA = buildFieldMetadata({
  id: TASK_TARGETS_FIELD_METADATA_ID,
  universalIdentifier:
    STANDARD_OBJECTS.task.fields.taskTargets.universalIdentifier,
  type: FieldMetadataType.RELATION,
  relationTargetObjectMetadataId: TASK_TARGET_OBJECT_METADATA_ID,
  settings: { relationType: RelationType.ONE_TO_MANY },
});

const CUSTOM_NOTE_TARGET_FIELD_METADATA = buildFieldMetadata({
  id: CUSTOM_NOTE_TARGET_FIELD_METADATA_ID,
  universalIdentifier: '20202020-0000-0000-0000-000000000010',
  objectMetadataId: NOTE_TARGET_OBJECT_METADATA_ID,
  type: FieldMetadataType.MORPH_RELATION,
  morphId: STANDARD_OBJECTS.noteTarget.morphIds.targetMorphId.morphId,
  settings: { relationType: RelationType.MANY_TO_ONE },
});

const CUSTOM_TASK_TARGET_FIELD_METADATA = buildFieldMetadata({
  id: CUSTOM_TASK_TARGET_FIELD_METADATA_ID,
  universalIdentifier: '20202020-0000-0000-0000-000000000011',
  objectMetadataId: TASK_TARGET_OBJECT_METADATA_ID,
  type: FieldMetadataType.MORPH_RELATION,
  morphId: STANDARD_OBJECTS.taskTarget.morphIds.targetMorphId.morphId,
  settings: { relationType: RelationType.MANY_TO_ONE },
});

const LEGACY_NOTE_TARGET_PERSON_FIELD_METADATA = buildFieldMetadata({
  id: LEGACY_NOTE_TARGET_PERSON_FIELD_METADATA_ID,
  universalIdentifier: LEGACY_NOTE_TARGET_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectMetadataId: NOTE_TARGET_OBJECT_METADATA_ID,
  type: FieldMetadataType.RELATION,
  settings: { relationType: RelationType.MANY_TO_ONE },
});

describe('RepairActivityTargetsJunctionTargetCommand', () => {
  const workspaceMigrationRunnerService = {} as WorkspaceMigrationRunnerService;
  let command: RepairActivityTargetsJunctionTargetCommand;
  let findMock: jest.Mock;
  let findOneMock: jest.Mock;
  let updateMock: jest.Mock;

  const initializeCommand = ({
    activeFieldMetadatas,
    lockedJunctionRelationFieldMetadatas,
  }: {
    activeFieldMetadatas: FieldMetadataEntity[];
    lockedJunctionRelationFieldMetadatas: FieldMetadataEntity[];
  }) => {
    findMock = jest.fn().mockResolvedValue(activeFieldMetadatas);
    findOneMock = jest
      .fn()
      .mockImplementation(({ where: { id } }: { where: { id: string } }) =>
        Promise.resolve(
          lockedJunctionRelationFieldMetadatas.find(
            (fieldMetadata) => fieldMetadata.id === id,
          ) ?? null,
        ),
      );
    updateMock = jest.fn();

    const transactionalRepository = {
      find: findMock,
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

    command = new RepairActivityTargetsJunctionTargetCommand(
      {} as WorkspaceIteratorService,
      workspaceMigrationRunnerService,
      fieldMetadataRepository,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('repairs note and task junctions that only have custom morph targets', async () => {
    initializeCommand({
      activeFieldMetadatas: [
        NOTE_TARGETS_FIELD_METADATA,
        TASK_TARGETS_FIELD_METADATA,
        CUSTOM_NOTE_TARGET_FIELD_METADATA,
        CUSTOM_TASK_TARGET_FIELD_METADATA,
      ],
      lockedJunctionRelationFieldMetadatas: [
        NOTE_TARGETS_FIELD_METADATA,
        TASK_TARGETS_FIELD_METADATA,
      ],
    });

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
    });

    expect(findMock).toHaveBeenCalledWith({
      where: { workspaceId: WORKSPACE_ID, isActive: true },
      order: { universalIdentifier: 'ASC' },
    });
    expect(updateMock).toHaveBeenNthCalledWith(
      1,
      { id: NOTE_TARGETS_FIELD_METADATA_ID, workspaceId: WORKSPACE_ID },
      {
        settings: {
          relationType: RelationType.ONE_TO_MANY,
          junctionTargetFieldId: CUSTOM_NOTE_TARGET_FIELD_METADATA_ID,
        },
      },
    );
    expect(updateMock).toHaveBeenNthCalledWith(
      2,
      { id: TASK_TARGETS_FIELD_METADATA_ID, workspaceId: WORKSPACE_ID },
      {
        settings: {
          relationType: RelationType.ONE_TO_MANY,
          junctionTargetFieldId: CUSTOM_TASK_TARGET_FIELD_METADATA_ID,
        },
      },
    );
    expect(invalidateFieldMetadataCacheMock).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      workspaceMigrationRunnerService,
    });
  });

  it('preserves a valid legacy junction target', async () => {
    const noteTargetsFieldMetadata = buildFieldMetadata({
      ...NOTE_TARGETS_FIELD_METADATA,
      settings: {
        relationType: RelationType.ONE_TO_MANY,
        junctionTargetFieldId: LEGACY_NOTE_TARGET_PERSON_FIELD_METADATA_ID,
      },
    });

    initializeCommand({
      activeFieldMetadatas: [
        noteTargetsFieldMetadata,
        LEGACY_NOTE_TARGET_PERSON_FIELD_METADATA,
      ],
      lockedJunctionRelationFieldMetadatas: [noteTargetsFieldMetadata],
    });

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
    });

    expect(updateMock).not.toHaveBeenCalled();
    expect(invalidateFieldMetadataCacheMock).not.toHaveBeenCalled();
  });

  it('reports repairs without writing during a dry run', async () => {
    initializeCommand({
      activeFieldMetadatas: [
        NOTE_TARGETS_FIELD_METADATA,
        CUSTOM_NOTE_TARGET_FIELD_METADATA,
      ],
      lockedJunctionRelationFieldMetadatas: [NOTE_TARGETS_FIELD_METADATA],
    });

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun: true },
      index: 0,
      total: 1,
    });

    expect(updateMock).not.toHaveBeenCalled();
    expect(invalidateFieldMetadataCacheMock).not.toHaveBeenCalled();
  });

  it('ignores targets from another morph group', async () => {
    const unrelatedMorphFieldMetadata = buildFieldMetadata({
      ...CUSTOM_NOTE_TARGET_FIELD_METADATA,
      morphId: '20202020-0000-0000-0000-000000000012',
    });

    initializeCommand({
      activeFieldMetadatas: [
        NOTE_TARGETS_FIELD_METADATA,
        unrelatedMorphFieldMetadata,
      ],
      lockedJunctionRelationFieldMetadatas: [NOTE_TARGETS_FIELD_METADATA],
    });

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
    });

    expect(findOneMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
    expect(invalidateFieldMetadataCacheMock).not.toHaveBeenCalled();
  });
});
