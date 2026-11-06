import { Test } from '@nestjs/testing';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { AddExportNoteToPdfCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1794053379135-add-export-note-to-pdf-command-menu-item.command';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

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
const ITEM_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.exportNoteToPdf.universalIdentifier;

const buildMaps = (universalIdentifiers: string[]) => ({
  byUniversalIdentifier: Object.fromEntries(
    universalIdentifiers.map((universalIdentifier) => [
      universalIdentifier,
      { universalIdentifier },
    ]),
  ),
});

describe('AddExportNoteToPdfCommandMenuItemCommand', () => {
  let command: AddExportNoteToPdfCommandMenuItemCommand;
  let getOrRecomputeMock: jest.Mock;
  let validateBuildAndRunLegacyWorkspaceMigrationMock: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    getOrRecomputeMock = jest.fn();
    validateBuildAndRunLegacyWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    computeTwentyStandardApplicationAllFlatEntityMapsMock.mockReturnValue({
      allFlatEntityMaps: {
        flatCommandMenuItemMaps: buildMaps([ITEM_UNIVERSAL_IDENTIFIER]),
      },
    });

    const module = await Test.createTestingModule({
      providers: [
        AddExportNoteToPdfCommandMenuItemCommand,
        { provide: WorkspaceIteratorService, useValue: {} },
        {
          provide: ApplicationService,
          useValue: {
            findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
              .fn()
              .mockResolvedValue({
                twentyStandardFlatApplication: STANDARD_APPLICATION,
              }),
          },
        },
        {
          provide: WorkspaceCacheService,
          useValue: { getOrRecompute: getOrRecomputeMock },
        },
        {
          provide: WorkspaceMigrationValidateBuildAndRunService,
          useValue: {
            validateBuildAndRunLegacyWorkspaceMigration:
              validateBuildAndRunLegacyWorkspaceMigrationMock,
          },
        },
      ],
    }).compile();
    command = module.get(AddExportNoteToPdfCommandMenuItemCommand);
  });

  const runOnWorkspace = ({
    existingItems,
    dryRun = false,
  }: {
    existingItems: string[];
    dryRun?: boolean;
  }) => {
    getOrRecomputeMock.mockResolvedValue({
      flatCommandMenuItemMaps: buildMaps(existingItems),
    });

    return command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });
  };

  it('should add the command menu item when missing', async () => {
    await runOnWorkspace({ existingItems: [] });

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).toHaveBeenCalledTimes(1);
    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).toHaveBeenCalledWith({
      shouldDeferActions: false,
      isSystemBuild: true,
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: STANDARD_APPLICATION.universalIdentifier,
      allFlatEntityOperationByMetadataName: {
        commandMenuItem: {
          flatEntityToCreate: [
            { universalIdentifier: ITEM_UNIVERSAL_IDENTIFIER },
          ],
          flatEntityToDelete: [],
          flatEntityToUpdate: [],
        },
      },
    });
  });

  it('should do nothing when the item already exists', async () => {
    await runOnWorkspace({ existingItems: [ITEM_UNIVERSAL_IDENTIFIER] });

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });

  it('should not write metadata in dry-run mode', async () => {
    await runOnWorkspace({ existingItems: [], dryRun: true });

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });
});
