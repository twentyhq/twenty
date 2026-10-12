import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { AddToMessageListCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791832891598-add-to-message-list-command-menu-item.command';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';

const ADD_TO_MESSAGE_LIST_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.addToMessageList.universalIdentifier;

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-10-12T12:00:00.000Z',
    workspaceId: WORKSPACE_ID,
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const STANDARD_COMMAND_MENU_ITEMS_BY_UNIVERSAL_IDENTIFIER =
  allFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier;

describe('AddToMessageListCommandMenuItemCommand', () => {
  let command: AddToMessageListCommandMenuItemCommand;
  let getOrRecomputeMock: jest.Mock;
  let validateBuildAndRunLegacyWorkspaceMigrationMock: jest.Mock;

  beforeEach(() => {
    getOrRecomputeMock = jest.fn();
    validateBuildAndRunLegacyWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    command = new AddToMessageListCommandMenuItemCommand(
      {} as WorkspaceIteratorService,
      {
        getOrRecompute: getOrRecomputeMock,
      } as unknown as WorkspaceCacheService,
      {
        validateBuildAndRunLegacyWorkspaceMigration:
          validateBuildAndRunLegacyWorkspaceMigrationMock,
      } as unknown as WorkspaceMigrationValidateBuildAndRunService,
    );
  });

  const buildArgs = (dryRun = false) => ({
    workspaceId: WORKSPACE_ID,
    options: { dryRun },
    index: 0,
    total: 1,
  });

  const mockWorkspace = ({
    commandMenuItems,
    missingObjectUniversalIdentifier,
  }: {
    commandMenuItems: Partial<Record<string, FlatCommandMenuItem>>;
    missingObjectUniversalIdentifier?: string;
  }) => {
    const objectMetadataByUniversalIdentifier = {
      ...allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
    };

    if (missingObjectUniversalIdentifier !== undefined) {
      delete objectMetadataByUniversalIdentifier[
        missingObjectUniversalIdentifier
      ];
    }

    getOrRecomputeMock.mockResolvedValue({
      flatCommandMenuItemMaps: {
        ...allFlatEntityMaps.flatCommandMenuItemMaps,
        byUniversalIdentifier: commandMenuItems,
      },
      flatObjectMetadataMaps: {
        ...allFlatEntityMaps.flatObjectMetadataMaps,
        byUniversalIdentifier: objectMetadataByUniversalIdentifier,
      },
    });
  };

  const commandMenuItemsWithoutAddToList = {
    ...STANDARD_COMMAND_MENU_ITEMS_BY_UNIVERSAL_IDENTIFIER,
    [ADD_TO_MESSAGE_LIST_UNIVERSAL_IDENTIFIER]: undefined,
  };

  it('adds the Add to List command to a workspace that predates it', async () => {
    mockWorkspace({ commandMenuItems: commandMenuItemsWithoutAddToList });

    await command.runOnWorkspace(buildArgs());

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      isSystemBuild: true,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      allFlatEntityOperationByMetadataName: {
        commandMenuItem: {
          flatEntityToCreate: [
            expect.objectContaining({
              universalIdentifier: ADD_TO_MESSAGE_LIST_UNIVERSAL_IDENTIFIER,
              engineComponentKey: 'ADD_TO_MESSAGE_LIST',
            }),
          ],
          flatEntityToDelete: [],
          flatEntityToUpdate: [],
        },
      },
    });
  });

  it('does nothing when the workspace already has the command', async () => {
    mockWorkspace({
      commandMenuItems: STANDARD_COMMAND_MENU_ITEMS_BY_UNIVERSAL_IDENTIFIER,
    });

    await command.runOnWorkspace(buildArgs());

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });

  it.each([
    STANDARD_OBJECTS.messageList.universalIdentifier,
    STANDARD_OBJECTS.messageListMember.universalIdentifier,
  ])(
    'skips a workspace without the list objects (%s missing)',
    async (missingObjectUniversalIdentifier) => {
      mockWorkspace({
        commandMenuItems: commandMenuItemsWithoutAddToList,
        missingObjectUniversalIdentifier,
      });

      await command.runOnWorkspace(buildArgs());

      expect(
        validateBuildAndRunLegacyWorkspaceMigrationMock,
      ).not.toHaveBeenCalled();
    },
  );

  it('writes nothing on a dry run', async () => {
    mockWorkspace({ commandMenuItems: commandMenuItemsWithoutAddToList });

    await command.runOnWorkspace(buildArgs(true));

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });

  it('removes the Add to List command on down', async () => {
    mockWorkspace({
      commandMenuItems: STANDARD_COMMAND_MENU_ITEMS_BY_UNIVERSAL_IDENTIFIER,
    });

    await command.down(buildArgs());

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName.commandMenuItem,
    ).toEqual({
      flatEntityToCreate: [],
      flatEntityToDelete: [
        expect.objectContaining({
          universalIdentifier: ADD_TO_MESSAGE_LIST_UNIVERSAL_IDENTIFIER,
        }),
      ],
      flatEntityToUpdate: [],
    });
  });
});
