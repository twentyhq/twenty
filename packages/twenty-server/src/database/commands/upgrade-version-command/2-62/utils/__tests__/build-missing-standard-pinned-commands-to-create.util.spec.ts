import { buildMissingStandardPinnedCommandsToCreate } from 'src/database/commands/upgrade-version-command/2-62/utils/build-missing-standard-pinned-commands-to-create.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';
import { createStandardCommandMenuItemFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/command-menu-item/create-standard-command-menu-item-flat-metadata.util';
import { createStandardNavigationMenuItemCommandFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/navigation-menu-item/create-standard-navigation-menu-item-command-flat-metadata.util';

const WORKSPACE_ID = 'workspace-id';
const TWENTY_STANDARD_APPLICATION_ID = 'twenty-standard-application-id';
const NOW = '2026-11-22T00:00:00.000Z';

const buildFlatCommandMenuItem = (
  commandMenuItemName: keyof typeof STANDARD_COMMAND_MENU_ITEMS,
) =>
  createStandardCommandMenuItemFlatMetadata({
    commandMenuItemName,
    commandMenuItemId: `${commandMenuItemName}-id`,
    workspaceId: WORKSPACE_ID,
    twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    dependencyFlatEntityMaps: {
      flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
    },
    now: NOW,
  });

const buildFlatCommandMenuItemMaps = (
  commandMenuItemNames: (keyof typeof STANDARD_COMMAND_MENU_ITEMS)[],
) => ({
  ...createEmptyFlatEntityMaps(),
  byUniversalIdentifier: Object.fromEntries(
    commandMenuItemNames.map((commandMenuItemName) => [
      STANDARD_COMMAND_MENU_ITEMS[commandMenuItemName].universalIdentifier,
      buildFlatCommandMenuItem(commandMenuItemName),
    ]),
  ),
});

const buildFlatNavigationMenuItemMaps = (
  flatNavigationMenuItems: FlatNavigationMenuItem[],
): FlatEntityMaps<FlatNavigationMenuItem> => ({
  ...createEmptyFlatEntityMaps(),
  byUniversalIdentifier: Object.fromEntries(
    flatNavigationMenuItems.map((flatNavigationMenuItem) => [
      flatNavigationMenuItem.universalIdentifier,
      flatNavigationMenuItem,
    ]),
  ),
});

const buildPinnedSearchCommand = (universalIdentifier: string) =>
  createStandardNavigationMenuItemCommandFlatMetadata({
    universalIdentifier,
    flatCommandMenuItem: buildFlatCommandMenuItem('searchRecords'),
    position: 0,
    navigationMenuItemId: `${universalIdentifier}-id`,
    workspaceId: WORKSPACE_ID,
    twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    now: NOW,
  });

const getUniversalIdentifiers = (
  flatNavigationMenuItems: FlatNavigationMenuItem[],
) => flatNavigationMenuItems.map(({ universalIdentifier }) => universalIdentifier);

describe('buildMissingStandardPinnedCommandsToCreate', () => {
  it('should pin Search and New chat on a workspace that has neither', () => {
    const flatNavigationMenuItems = buildMissingStandardPinnedCommandsToCreate({
      flatNavigationMenuItemMaps: buildFlatNavigationMenuItemMaps([]),
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        'searchRecords',
        'newAiChat',
      ]),
      workspaceId: WORKSPACE_ID,
      now: NOW,
    });

    expect(
      flatNavigationMenuItems.map(
        ({
          universalIdentifier,
          commandMenuItemId,
          applicationId,
          parentId,
          position,
        }) => ({
          universalIdentifier,
          commandMenuItemId,
          applicationId,
          parentId,
          position,
        }),
      ),
    ).toEqual([
      {
        universalIdentifier:
          STANDARD_NAVIGATION_MENU_ITEMS.searchCommand.universalIdentifier,
        commandMenuItemId: 'searchRecords-id',
        applicationId: TWENTY_STANDARD_APPLICATION_ID,
        parentId: null,
        position: 0,
      },
      {
        universalIdentifier:
          STANDARD_NAVIGATION_MENU_ITEMS.newAiChatCommand.universalIdentifier,
        commandMenuItemId: 'newAiChat-id',
        applicationId: TWENTY_STANDARD_APPLICATION_ID,
        parentId: null,
        position: 1,
      },
    ]);
  });

  it('should leave a hidden standard pinned command hidden', () => {
    const flatNavigationMenuItems = buildMissingStandardPinnedCommandsToCreate({
      flatNavigationMenuItemMaps: buildFlatNavigationMenuItemMaps([
        {
          ...buildPinnedSearchCommand(
            STANDARD_NAVIGATION_MENU_ITEMS.searchCommand.universalIdentifier,
          ),
          isActive: false,
        },
      ]),
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        'searchRecords',
        'newAiChat',
      ]),
      workspaceId: WORKSPACE_ID,
      now: NOW,
    });

    expect(getUniversalIdentifiers(flatNavigationMenuItems)).toEqual([
      STANDARD_NAVIGATION_MENU_ITEMS.newAiChatCommand.universalIdentifier,
    ]);
  });

  it('should not pin a command the workspace layout already pins', () => {
    const flatNavigationMenuItems = buildMissingStandardPinnedCommandsToCreate({
      flatNavigationMenuItemMaps: buildFlatNavigationMenuItemMaps([
        buildPinnedSearchCommand('20202020-c004-4c04-8c04-c0aba11c0004'),
      ]),
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        'searchRecords',
        'newAiChat',
      ]),
      workspaceId: WORKSPACE_ID,
      now: NOW,
    });

    expect(getUniversalIdentifiers(flatNavigationMenuItems)).toEqual([
      STANDARD_NAVIGATION_MENU_ITEMS.newAiChatCommand.universalIdentifier,
    ]);
  });

  it('should skip a pinned command whose command the workspace does not have', () => {
    const flatNavigationMenuItems = buildMissingStandardPinnedCommandsToCreate({
      flatNavigationMenuItemMaps: buildFlatNavigationMenuItemMaps([]),
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps(['searchRecords']),
      workspaceId: WORKSPACE_ID,
      now: NOW,
    });

    expect(getUniversalIdentifiers(flatNavigationMenuItems)).toEqual([
      STANDARD_NAVIGATION_MENU_ITEMS.searchCommand.universalIdentifier,
    ]);
  });
});
