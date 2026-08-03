import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { RecreateMissingStandardCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-27/2-27-workspace-command-1785505200000-recreate-missing-standard-command-menu-items.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

jest.mock(
  'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant',
);

const computeTwentyStandardApplicationAllFlatEntityMapsMock =
  computeTwentyStandardApplicationAllFlatEntityMaps as jest.Mock;

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const STANDARD_APPLICATION = {
  id: '20202020-0000-0000-0000-0000000000aa',
  universalIdentifier: '20202020-0000-0000-0000-0000000000bb',
};

const STANDARD_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS = [
  '20202020-0000-0000-0000-000000000010',
  '20202020-0000-0000-0000-000000000011',
  '20202020-0000-0000-0000-000000000012',
];

const buildByUniversalIdentifierMap = (universalIdentifiers: string[]) => ({
  byUniversalIdentifier: Object.fromEntries(
    universalIdentifiers.map((universalIdentifier) => [
      universalIdentifier,
      { universalIdentifier },
    ]),
  ),
});

describe('RecreateMissingStandardCommandMenuItemsCommand', () => {
  let command: RecreateMissingStandardCommandMenuItemsCommand;
  let findApplicationMock: jest.Mock;
  let getOrRecomputeMock: jest.Mock;
  let validateBuildAndRunLegacyWorkspaceMigrationMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    findApplicationMock = jest.fn().mockResolvedValue({
      twentyStandardFlatApplication: STANDARD_APPLICATION,
    });
    getOrRecomputeMock = jest.fn();
    validateBuildAndRunLegacyWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    computeTwentyStandardApplicationAllFlatEntityMapsMock.mockReturnValue({
      allFlatEntityMaps: {
        flatCommandMenuItemMaps: buildByUniversalIdentifierMap(
          STANDARD_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS,
        ),
      },
    });

    command = new RecreateMissingStandardCommandMenuItemsCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow:
          findApplicationMock,
      } as unknown as ApplicationService,
      {
        validateBuildAndRunLegacyWorkspaceMigration:
          validateBuildAndRunLegacyWorkspaceMigrationMock,
      } as unknown as WorkspaceMigrationValidateBuildAndRunService,
      {
        getOrRecompute: getOrRecomputeMock,
      } as unknown as WorkspaceCacheService,
    );
  });

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  const mockWorkspaceCache = (existingCommandMenuItems: string[]) => {
    getOrRecomputeMock.mockResolvedValue({
      flatCommandMenuItemMaps: buildByUniversalIdentifierMap(
        existingCommandMenuItems,
      ),
    });
  };

  it('recreates every missing standard command menu item when none exist', async () => {
    mockWorkspaceCache([]);

    await runOnWorkspace();

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).toHaveBeenCalledWith({
      isSystemBuild: true,
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: STANDARD_APPLICATION.universalIdentifier,
      allFlatEntityOperationByMetadataName: {
        commandMenuItem: {
          flatEntityToCreate: expect.arrayContaining(
            STANDARD_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.map(
              (universalIdentifier) =>
                expect.objectContaining({ universalIdentifier }),
            ),
          ),
          flatEntityToDelete: [],
          flatEntityToUpdate: [],
        },
      },
    });
    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName.commandMenuItem
        .flatEntityToCreate,
    ).toHaveLength(STANDARD_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.length);
  });

  it('only recreates the items missing from a partially seeded workspace', async () => {
    mockWorkspaceCache([STANDARD_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS[0]]);

    await runOnWorkspace();

    const payload =
      validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName.commandMenuItem;

    expect(payload.flatEntityToCreate).toEqual(
      expect.arrayContaining(
        STANDARD_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.slice(1).map(
          (universalIdentifier) =>
            expect.objectContaining({ universalIdentifier }),
        ),
      ),
    );
    expect(payload.flatEntityToCreate).toHaveLength(
      STANDARD_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.length - 1,
    );
    expect(payload.flatEntityToUpdate).toEqual([]);
    expect(payload.flatEntityToDelete).toEqual([]);
  });

  it('never touches existing command menu items (additive only)', async () => {
    mockWorkspaceCache(STANDARD_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS);

    await runOnWorkspace();

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });

  it('does not write metadata in dry-run mode', async () => {
    mockWorkspaceCache([]);

    await runOnWorkspace(true);

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });
});
