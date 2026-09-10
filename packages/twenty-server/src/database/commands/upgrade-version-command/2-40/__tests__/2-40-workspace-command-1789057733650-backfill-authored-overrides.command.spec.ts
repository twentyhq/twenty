import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { BackfillAuthoredOverridesCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1789057733650-backfill-authored-overrides.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';
const OBJECT_ID = '20202020-0000-4000-8000-0000000000b1';
const OBJECT_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-0000000000bb';

const EMPTY_FLAT_MAPS_KEYS = [
  'flatViewMaps',
  'flatViewFieldMaps',
  'flatViewFieldGroupMaps',
  'flatPageLayoutTabMaps',
  'flatPageLayoutWidgetMaps',
  'flatTimelineActivityTypeMaps',
] as const;

const buildFlatEntityMaps = <T extends { universalIdentifier: string }>(
  flatEntities: T[],
  ids: Record<string, string> = {},
) => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
  universalIdentifierById: ids,
  universalIdentifiersByApplicationId: {},
});

describe('BackfillAuthoredOverridesCommand', () => {
  let command: BackfillAuthoredOverridesCommand;
  let getOrRecomputeMock: jest.Mock;
  let invalidateCacheMock: jest.Mock;
  let updateMock: jest.Mock;
  let getRepositoryMock: jest.Mock;

  beforeEach(() => {
    getOrRecomputeMock = jest.fn();
    invalidateCacheMock = jest.fn().mockResolvedValue(undefined);
    updateMock = jest.fn().mockResolvedValue(undefined);
    getRepositoryMock = jest.fn(() => ({ update: updateMock }));

    const objectMetadataRepositoryMock = {
      manager: {
        transaction: jest.fn(
          async (callback: (entityManager: unknown) => Promise<void>) =>
            callback({ getRepository: getRepositoryMock }),
        ),
      },
    };

    command = new BackfillAuthoredOverridesCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
          .fn()
          .mockResolvedValue({
            workspaceCustomFlatApplication: { universalIdentifier: CUSTOM },
          }),
      } as unknown as ApplicationService,
      { getOrRecompute: getOrRecomputeMock } as unknown as WorkspaceCacheService,
      {
        invalidateCache: invalidateCacheMock,
      } as unknown as WorkspaceMigrationRunnerService,
      objectMetadataRepositoryMock as never,
    );
  });

  const mockWorkspaceCache = ({
    flatObjectMetadatas = [],
    flatFieldMetadatas = [],
    flatCommandMenuItems = [],
  }: {
    flatObjectMetadatas?: object[];
    flatFieldMetadatas?: object[];
    flatCommandMenuItems?: object[];
  }) => {
    getOrRecomputeMock.mockResolvedValue({
      flatObjectMetadataMaps: buildFlatEntityMaps(
        flatObjectMetadatas as { universalIdentifier: string }[],
        { [OBJECT_ID]: OBJECT_UNIVERSAL_IDENTIFIER },
      ),
      flatFieldMetadataMaps: buildFlatEntityMaps(
        flatFieldMetadatas as { universalIdentifier: string }[],
      ),
      flatCommandMenuItemMaps: buildFlatEntityMaps(
        flatCommandMenuItems as { universalIdentifier: string }[],
      ),
      ...Object.fromEntries(
        EMPTY_FLAT_MAPS_KEYS.map((key) => [key, buildFlatEntityMaps([])]),
      ),
    });
  };

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  const deactivatedStandardObject = {
    id: OBJECT_ID,
    universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    applicationUniversalIdentifier: OWNER,
    isActive: false,
    overrides: { labelSingular: 'Société' },
  };

  const navigationCommand = {
    id: 'command-id',
    universalIdentifier: 'command-universal-identifier',
    applicationUniversalIdentifier: OWNER,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    navigationTargetObjectMetadataId: OBJECT_ID,
    isSystemSideEffect: true,
    isActive: false,
    overrides: null,
    universalOverrides: null,
  };

  it('writes the rewritten rows on their own tables and invalidates the cache', async () => {
    mockWorkspaceCache({
      flatObjectMetadatas: [deactivatedStandardObject],
      flatFieldMetadatas: [
        {
          id: 'field-id',
          universalIdentifier: 'field-universal-identifier',
          applicationUniversalIdentifier: OWNER,
          isActive: true,
          overrides: { [CUSTOM]: { label: 'Mine' } },
        },
        {
          id: 'legacy-field-id',
          universalIdentifier: 'legacy-field-universal-identifier',
          applicationUniversalIdentifier: OWNER,
          isActive: true,
          overrides: { label: 'Legacy' },
        },
      ],
    });

    await runOnWorkspace();

    expect(updateMock).toHaveBeenCalledTimes(2);
    expect(getRepositoryMock).toHaveBeenCalledWith(ObjectMetadataEntity);
    expect(updateMock).toHaveBeenCalledWith(
      { id: OBJECT_ID, workspaceId: WORKSPACE_ID },
      {
        overrides: { [CUSTOM]: { labelSingular: 'Société', isActive: false } },
        isActive: true,
      },
    );
    expect(getRepositoryMock).toHaveBeenCalledWith(FieldMetadataEntity);
    expect(updateMock).toHaveBeenCalledWith(
      { id: 'legacy-field-id', workspaceId: WORKSPACE_ID },
      { overrides: { [CUSTOM]: { label: 'Legacy' } } },
    );
    expect(invalidateCacheMock).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: WORKSPACE_ID,
        allFlatEntityMapsKeys: expect.arrayContaining([
          'flatObjectMetadataMaps',
          'flatFieldMetadataMaps',
          'flatCommandMenuItemMaps',
        ]),
      }),
    );
  });

  it('keeps the mirrored false of the navigation command of an inactive object', async () => {
    mockWorkspaceCache({
      flatObjectMetadatas: [deactivatedStandardObject],
      flatCommandMenuItems: [navigationCommand],
    });

    await runOnWorkspace();

    expect(getRepositoryMock).not.toHaveBeenCalledWith(CommandMenuItemEntity);
    expect(updateMock).toHaveBeenCalledTimes(1);
  });

  it('attributes the false of a navigation command whose object is active', async () => {
    mockWorkspaceCache({
      flatObjectMetadatas: [
        { ...deactivatedStandardObject, isActive: true, overrides: null },
      ],
      flatCommandMenuItems: [navigationCommand],
    });

    await runOnWorkspace();

    expect(getRepositoryMock).toHaveBeenCalledWith(CommandMenuItemEntity);
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith(
      { id: 'command-id', workspaceId: WORKSPACE_ID },
      {
        overrides: { [CUSTOM]: { isActive: false } },
        universalOverrides: { [CUSTOM]: { isActive: false } },
        isActive: true,
      },
    );
  });

  it('writes nothing in dry run and skips a converged workspace', async () => {
    mockWorkspaceCache({ flatObjectMetadatas: [deactivatedStandardObject] });

    await runOnWorkspace(true);

    expect(updateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();

    mockWorkspaceCache({
      flatObjectMetadatas: [
        { ...deactivatedStandardObject, isActive: true, overrides: null },
      ],
    });

    await runOnWorkspace();

    expect(updateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });
});
