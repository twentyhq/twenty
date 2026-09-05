import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { BackfillMessageListJunctionTargetsCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788616074386-backfill-message-list-junction-targets.command';
import { invalidateFieldMetadataCache } from 'src/database/commands/upgrade-version-command/utils/invalidate-field-metadata-cache.util';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
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
const LIST_MEMBER_OBJECT_METADATA_ID = '20202020-0000-0000-0000-000000000002';
const MEMBERS_FIELD_METADATA_ID = '20202020-0000-0000-0000-000000000003';
const LIST_MEMBERSHIPS_FIELD_METADATA_ID =
  '20202020-0000-0000-0000-000000000004';
const LIST_MEMBER_PERSON_FIELD_METADATA_ID =
  '20202020-0000-0000-0000-000000000005';
const LIST_MEMBER_LIST_FIELD_METADATA_ID =
  '20202020-0000-0000-0000-000000000006';
const DANGLING_FIELD_METADATA_ID = '20202020-0000-0000-0000-000000000007';
const UNRELATED_FIELD_METADATA_ID = '20202020-0000-0000-0000-000000000008';

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

// Carries a second settings key so the tests prove the backfill spreads the
// stored settings instead of replacing them.
const ONE_TO_MANY_SETTINGS = {
  relationType: RelationType.ONE_TO_MANY,
  onDelete: RelationOnDeleteAction.SET_NULL,
};

const buildMembersFlatFieldMetadata = (
  settingsOverrides: Record<string, unknown> = {},
) =>
  buildFlatFieldMetadata({
    id: MEMBERS_FIELD_METADATA_ID,
    universalIdentifier:
      STANDARD_OBJECTS.messageList.fields.members.universalIdentifier,
    type: FieldMetadataType.RELATION,
    relationTargetObjectMetadataId: LIST_MEMBER_OBJECT_METADATA_ID,
    settings: { ...ONE_TO_MANY_SETTINGS, ...settingsOverrides },
  });

const buildListMembershipsFlatFieldMetadata = (
  settingsOverrides: Record<string, unknown> = {},
) =>
  buildFlatFieldMetadata({
    id: LIST_MEMBERSHIPS_FIELD_METADATA_ID,
    universalIdentifier:
      STANDARD_OBJECTS.person.fields.listMemberships.universalIdentifier,
    type: FieldMetadataType.RELATION,
    relationTargetObjectMetadataId: LIST_MEMBER_OBJECT_METADATA_ID,
    settings: { ...ONE_TO_MANY_SETTINGS, ...settingsOverrides },
  });

const UNRELATED_FLAT_FIELD_METADATA = buildFlatFieldMetadata({
  id: UNRELATED_FIELD_METADATA_ID,
  universalIdentifier: '20202020-0000-0000-0000-000000000097',
  objectMetadataId: LIST_MEMBER_OBJECT_METADATA_ID,
  type: FieldMetadataType.RELATION,
  settings: { relationType: RelationType.MANY_TO_ONE },
});

const LIST_MEMBER_PERSON_FLAT_FIELD_METADATA = buildFlatFieldMetadata({
  id: LIST_MEMBER_PERSON_FIELD_METADATA_ID,
  universalIdentifier:
    STANDARD_OBJECTS.messageListMember.fields.person.universalIdentifier,
  objectMetadataId: LIST_MEMBER_OBJECT_METADATA_ID,
  type: FieldMetadataType.RELATION,
  settings: { relationType: RelationType.MANY_TO_ONE },
});

const LIST_MEMBER_LIST_FLAT_FIELD_METADATA = buildFlatFieldMetadata({
  id: LIST_MEMBER_LIST_FIELD_METADATA_ID,
  universalIdentifier:
    STANDARD_OBJECTS.messageListMember.fields.list.universalIdentifier,
  objectMetadataId: LIST_MEMBER_OBJECT_METADATA_ID,
  type: FieldMetadataType.RELATION,
  settings: { relationType: RelationType.MANY_TO_ONE },
});

describe('BackfillMessageListJunctionTargetsCommand', () => {
  let findOneMock: jest.Mock;
  let updateMock: jest.Mock;
  let getOrRecomputeMock: jest.Mock;
  let command: BackfillMessageListJunctionTargetsCommand;

  beforeEach(() => {
    jest.clearAllMocks();

    findOneMock = jest.fn();
    updateMock = jest.fn();
    getOrRecomputeMock = jest.fn();

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

    command = new BackfillMessageListJunctionTargetsCommand(
      {} as WorkspaceIteratorService,
      {
        getOrRecompute: getOrRecomputeMock,
      } as unknown as WorkspaceCacheService,
      {} as WorkspaceMigrationRunnerService,
      fieldMetadataRepository,
    );
  });

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  // The transaction re-read returns the same rows the cache was seeded with
  // unless a test overrides it to simulate a row that moved on.
  const mockFlatFieldMetadatas = (flatFieldMetadatas: FlatFieldMetadata[]) => {
    getOrRecomputeMock.mockResolvedValue({
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps(flatFieldMetadatas),
    });
    findOneMock.mockImplementation(({ where: { id } }: { where: { id: string } }) =>
      Promise.resolve(
        flatFieldMetadatas.find((flatFieldMetadata) => flatFieldMetadata.id === id),
      ),
    );
  };

  it('backfills both sides of the messageList/person junction', async () => {
    mockFlatFieldMetadatas([
      buildMembersFlatFieldMetadata(),
      buildListMembershipsFlatFieldMetadata(),
      LIST_MEMBER_PERSON_FLAT_FIELD_METADATA,
      LIST_MEMBER_LIST_FLAT_FIELD_METADATA,
    ]);

    await runOnWorkspace();

    expect(updateMock).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenNthCalledWith(
      1,
      { id: MEMBERS_FIELD_METADATA_ID, workspaceId: WORKSPACE_ID },
      {
        settings: {
          ...ONE_TO_MANY_SETTINGS,
          junctionTargetFieldId: LIST_MEMBER_PERSON_FIELD_METADATA_ID,
        },
      },
    );
    expect(updateMock).toHaveBeenNthCalledWith(
      2,
      { id: LIST_MEMBERSHIPS_FIELD_METADATA_ID, workspaceId: WORKSPACE_ID },
      {
        settings: {
          ...ONE_TO_MANY_SETTINGS,
          junctionTargetFieldId: LIST_MEMBER_LIST_FIELD_METADATA_ID,
        },
      },
    );
    expect(invalidateFieldMetadataCacheMock).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      workspaceMigrationRunnerService: expect.anything(),
    });
  });

  it('only backfills the person side when the list side was already set by the 2-25 backfill', async () => {
    mockFlatFieldMetadatas([
      buildMembersFlatFieldMetadata({
        junctionTargetFieldId: LIST_MEMBER_PERSON_FIELD_METADATA_ID,
      }),
      buildListMembershipsFlatFieldMetadata(),
      LIST_MEMBER_PERSON_FLAT_FIELD_METADATA,
      LIST_MEMBER_LIST_FLAT_FIELD_METADATA,
    ]);

    await runOnWorkspace();

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith(
      { id: LIST_MEMBERSHIPS_FIELD_METADATA_ID, workspaceId: WORKSPACE_ID },
      {
        settings: {
          ...ONE_TO_MANY_SETTINGS,
          junctionTargetFieldId: LIST_MEMBER_LIST_FIELD_METADATA_ID,
        },
      },
    );
  });

  it('repairs a junction target pointing at a field that no longer exists', async () => {
    mockFlatFieldMetadatas([
      buildMembersFlatFieldMetadata({
        junctionTargetFieldId: DANGLING_FIELD_METADATA_ID,
      }),
      buildListMembershipsFlatFieldMetadata({
        junctionTargetFieldId: LIST_MEMBER_LIST_FIELD_METADATA_ID,
      }),
      LIST_MEMBER_PERSON_FLAT_FIELD_METADATA,
      LIST_MEMBER_LIST_FLAT_FIELD_METADATA,
    ]);

    await runOnWorkspace();

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith(
      { id: MEMBERS_FIELD_METADATA_ID, workspaceId: WORKSPACE_ID },
      {
        settings: {
          ...ONE_TO_MANY_SETTINGS,
          junctionTargetFieldId: LIST_MEMBER_PERSON_FIELD_METADATA_ID,
        },
      },
    );
  });

  it('repairs a junction target pointing at another existing field', async () => {
    mockFlatFieldMetadatas([
      buildMembersFlatFieldMetadata({
        junctionTargetFieldId: UNRELATED_FIELD_METADATA_ID,
      }),
      buildListMembershipsFlatFieldMetadata({
        junctionTargetFieldId: LIST_MEMBER_LIST_FIELD_METADATA_ID,
      }),
      LIST_MEMBER_PERSON_FLAT_FIELD_METADATA,
      LIST_MEMBER_LIST_FLAT_FIELD_METADATA,
      UNRELATED_FLAT_FIELD_METADATA,
    ]);

    await runOnWorkspace();

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith(
      { id: MEMBERS_FIELD_METADATA_ID, workspaceId: WORKSPACE_ID },
      {
        settings: {
          ...ONE_TO_MANY_SETTINGS,
          junctionTargetFieldId: LIST_MEMBER_PERSON_FIELD_METADATA_ID,
        },
      },
    );
  });

  it('skips a row already set by another run since the cache was computed', async () => {
    mockFlatFieldMetadatas([
      buildMembersFlatFieldMetadata(),
      buildListMembershipsFlatFieldMetadata({
        junctionTargetFieldId: LIST_MEMBER_LIST_FIELD_METADATA_ID,
      }),
      LIST_MEMBER_PERSON_FLAT_FIELD_METADATA,
      LIST_MEMBER_LIST_FLAT_FIELD_METADATA,
    ]);
    findOneMock.mockResolvedValue(
      buildMembersFlatFieldMetadata({
        junctionTargetFieldId: LIST_MEMBER_PERSON_FIELD_METADATA_ID,
      }),
    );

    await runOnWorkspace();

    expect(updateMock).not.toHaveBeenCalled();
    expect(invalidateFieldMetadataCacheMock).not.toHaveBeenCalled();
  });

  it('does nothing when both sides are already set', async () => {
    mockFlatFieldMetadatas([
      buildMembersFlatFieldMetadata({
        junctionTargetFieldId: LIST_MEMBER_PERSON_FIELD_METADATA_ID,
      }),
      buildListMembershipsFlatFieldMetadata({
        junctionTargetFieldId: LIST_MEMBER_LIST_FIELD_METADATA_ID,
      }),
      LIST_MEMBER_PERSON_FLAT_FIELD_METADATA,
      LIST_MEMBER_LIST_FLAT_FIELD_METADATA,
    ]);

    await runOnWorkspace();

    expect(updateMock).not.toHaveBeenCalled();
    expect(invalidateFieldMetadataCacheMock).not.toHaveBeenCalled();
  });

  it('skips workspaces without the message list objects', async () => {
    mockFlatFieldMetadatas([]);

    await runOnWorkspace();

    expect(updateMock).not.toHaveBeenCalled();
    expect(invalidateFieldMetadataCacheMock).not.toHaveBeenCalled();
  });

  it('does not write metadata in dry-run mode', async () => {
    mockFlatFieldMetadatas([
      buildMembersFlatFieldMetadata(),
      buildListMembershipsFlatFieldMetadata(),
      LIST_MEMBER_PERSON_FLAT_FIELD_METADATA,
      LIST_MEMBER_LIST_FLAT_FIELD_METADATA,
    ]);

    await runOnWorkspace(true);

    expect(updateMock).not.toHaveBeenCalled();
    expect(invalidateFieldMetadataCacheMock).not.toHaveBeenCalled();
  });
});
