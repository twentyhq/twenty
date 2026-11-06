import { Test } from '@nestjs/testing';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { AddDuplicateMessageListCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788639976437-add-duplicate-message-list-command-menu-item.command';
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
  STANDARD_COMMAND_MENU_ITEMS.duplicateMessageList.universalIdentifier;
const STANDARD_ITEM = { universalIdentifier: ITEM_UNIVERSAL_IDENTIFIER };

const buildMaps = (universalIdentifiers: string[]) => ({
  byUniversalIdentifier: Object.fromEntries(
    universalIdentifiers.map((universalIdentifier) => [
      universalIdentifier,
      { universalIdentifier },
    ]),
  ),
});

describe('AddDuplicateMessageListCommandMenuItemCommand', () => {
  let command: AddDuplicateMessageListCommandMenuItemCommand;
  let getOrRecomputeMock: jest.Mock;
  let validateBuildAndRunWorkspaceMigrationMock: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    getOrRecomputeMock = jest.fn();
    validateBuildAndRunWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    computeTwentyStandardApplicationAllFlatEntityMapsMock.mockReturnValue({
      allFlatEntityMaps: {
        flatCommandMenuItemMaps: buildMaps([ITEM_UNIVERSAL_IDENTIFIER]),
      },
    });

    const module = await Test.createTestingModule({
      providers: [
        AddDuplicateMessageListCommandMenuItemCommand,
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
            validateBuildAndRunWorkspaceMigration:
              validateBuildAndRunWorkspaceMigrationMock,
          },
        },
      ],
    }).compile();
    command = module.get(AddDuplicateMessageListCommandMenuItemCommand);
  });

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  const mockWorkspaceCache = ({
    existingObjects = [
      STANDARD_OBJECTS.messageList.universalIdentifier,
      STANDARD_OBJECTS.messageListMember.universalIdentifier,
    ],
    existingItems = [] as string[],
  } = {}) => {
    getOrRecomputeMock.mockResolvedValue({
      flatObjectMetadataMaps: buildMaps(existingObjects),
      flatCommandMenuItemMaps: buildMaps(existingItems),
    });
  };

  it('adds the command menu item when missing', async () => {
    mockWorkspaceCache();

    await runOnWorkspace();

    expect(validateBuildAndRunWorkspaceMigrationMock).toHaveBeenCalledWith({
      shouldDeferActions: false,
      isSystemBuild: true,
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: STANDARD_APPLICATION.universalIdentifier,
      allFlatEntityOperationByMetadataName: {
        commandMenuItem: {
          flatEntityToCreate: [STANDARD_ITEM],
          flatEntityToDelete: [],
          flatEntityToUpdate: [],
        },
      },
    });
  });

  it('does nothing when the item already exists', async () => {
    mockWorkspaceCache({ existingItems: [ITEM_UNIVERSAL_IDENTIFIER] });

    await runOnWorkspace();

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('skips workspaces without the messageList object', async () => {
    mockWorkspaceCache({ existingObjects: [] });

    await runOnWorkspace();

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('skips workspaces without the messageListMember object', async () => {
    mockWorkspaceCache({
      existingObjects: [STANDARD_OBJECTS.messageList.universalIdentifier],
    });

    await runOnWorkspace();

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('does not write metadata in dry-run mode', async () => {
    mockWorkspaceCache();

    await runOnWorkspace(true);

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });
});
