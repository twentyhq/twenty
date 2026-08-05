import { getNavigationCommandUniversalIdentifier } from 'twenty-shared/application';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ReownObjectNavigationCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-31/2-31-workspace-command-1786500000000-reown-object-navigation-command-menu-items.command';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000ad';
const OBJECT_ID = '20202020-0000-4000-8000-0000000000b1';
const OBJECT_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-0000000000bb';

const DERIVED_UNIVERSAL_IDENTIFIER = getNavigationCommandUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
});

type WorkspaceCommandMenuItem = {
  id: string;
  universalIdentifier: string;
  engineComponentKey?: EngineComponentKey;
  payload?: object | null;
  isSystemSideEffect?: boolean;
};

const buildFlatCommandMenuItem = (
  commandMenuItem: WorkspaceCommandMenuItem,
) => ({
  engineComponentKey: EngineComponentKey.NAVIGATION,
  payload: { objectMetadataItemId: OBJECT_ID },
  isSystemSideEffect: true,
  ...commandMenuItem,
});

const buildByUniversalIdentifierMap = <
  T extends { universalIdentifier: string },
>(
  flatEntities: T[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
});

describe('ReownObjectNavigationCommandMenuItemsCommand', () => {
  let command: ReownObjectNavigationCommandMenuItemsCommand;
  let getOrRecomputeMock: jest.Mock;
  let invalidateCacheMock: jest.Mock;
  let commandMenuItemUpdateMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    getOrRecomputeMock = jest.fn();
    invalidateCacheMock = jest.fn().mockResolvedValue(undefined);
    commandMenuItemUpdateMock = jest.fn().mockResolvedValue(undefined);

    const entityManagerMock = {
      getRepository: () => ({ update: commandMenuItemUpdateMock }),
    };

    const commandMenuItemRepositoryMock = {
      manager: {
        transaction: jest.fn(
          async (callback: (entityManager: unknown) => Promise<void>) =>
            callback(entityManagerMock),
        ),
      },
    };

    command = new ReownObjectNavigationCommandMenuItemsCommand(
      {} as WorkspaceIteratorService,
      {
        getOrRecompute: getOrRecomputeMock,
      } as unknown as WorkspaceCacheService,
      {
        invalidateCache: invalidateCacheMock,
      } as unknown as WorkspaceMigrationRunnerService,
      commandMenuItemRepositoryMock as never,
    );
  });

  const mockWorkspaceCache = (
    commandMenuItems: ReturnType<typeof buildFlatCommandMenuItem>[],
  ) => {
    getOrRecomputeMock.mockResolvedValue({
      flatCommandMenuItemMaps: buildByUniversalIdentifierMap(commandMenuItems),
      flatObjectMetadataMaps: {
        ...buildByUniversalIdentifierMap([
          {
            universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
            applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          },
        ]),
        universalIdentifierById: { [OBJECT_ID]: OBJECT_UNIVERSAL_IDENTIFIER },
      },
    });
  };

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  it('re-owns a legacy-identifier navigation command onto the derived identifier', async () => {
    mockWorkspaceCache([
      buildFlatCommandMenuItem({
        id: 'command-id',
        universalIdentifier: 'legacy-v5-identifier',
      }),
    ]);

    await runOnWorkspace();

    expect(commandMenuItemUpdateMock).toHaveBeenCalledTimes(1);
    expect(commandMenuItemUpdateMock).toHaveBeenCalledWith(
      { id: 'command-id', workspaceId: WORKSPACE_ID },
      { universalIdentifier: DERIVED_UNIVERSAL_IDENTIFIER },
    );
    expect(invalidateCacheMock).toHaveBeenCalledTimes(1);
  });

  it('also reconciles the flag when a legacy row carries isSystemSideEffect false', async () => {
    mockWorkspaceCache([
      buildFlatCommandMenuItem({
        id: 'command-id',
        universalIdentifier: 'legacy-v5-identifier',
        isSystemSideEffect: false,
      }),
    ]);

    await runOnWorkspace();

    expect(commandMenuItemUpdateMock).toHaveBeenCalledWith(
      { id: 'command-id', workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: DERIVED_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: true,
      },
    );
  });

  it('is a noop for rows already holding their derived identifier', async () => {
    mockWorkspaceCache([
      buildFlatCommandMenuItem({
        id: 'command-id',
        universalIdentifier: DERIVED_UNIVERSAL_IDENTIFIER,
      }),
    ]);

    await runOnWorkspace();

    expect(commandMenuItemUpdateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });

  it('skips path-based NAVIGATION commands and rows whose object is missing', async () => {
    mockWorkspaceCache([
      buildFlatCommandMenuItem({
        id: 'path-command-id',
        universalIdentifier: 'path-identifier',
        payload: { path: '/settings/profile' },
      }),
      buildFlatCommandMenuItem({
        id: 'orphan-command-id',
        universalIdentifier: 'orphan-identifier',
        payload: { objectMetadataItemId: 'missing-object-id' },
      }),
    ]);

    await runOnWorkspace();

    expect(commandMenuItemUpdateMock).not.toHaveBeenCalled();
  });

  it('skips the re-own when the derived identifier is already held by another row', async () => {
    mockWorkspaceCache([
      buildFlatCommandMenuItem({
        id: 'legacy-command-id',
        universalIdentifier: 'legacy-v5-identifier',
      }),
      buildFlatCommandMenuItem({
        id: 'holder-command-id',
        universalIdentifier: DERIVED_UNIVERSAL_IDENTIFIER,
        payload: { path: '/unrelated' },
      }),
    ]);

    await runOnWorkspace();

    expect(commandMenuItemUpdateMock).not.toHaveBeenCalled();
  });

  it('does not write anything in dry-run mode', async () => {
    mockWorkspaceCache([
      buildFlatCommandMenuItem({
        id: 'command-id',
        universalIdentifier: 'legacy-v5-identifier',
      }),
    ]);

    await runOnWorkspace(true);

    expect(commandMenuItemUpdateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });
});
