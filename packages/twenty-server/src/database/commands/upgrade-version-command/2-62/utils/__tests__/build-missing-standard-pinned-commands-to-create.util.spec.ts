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

const buildFlatCommandMenuItemMaps = (
  commandMenuItemNames: (keyof typeof STANDARD_COMMAND_MENU_ITEMS)[],
) => ({
  ...createEmptyFlatEntityMaps(),
  byUniversalIdentifier: Object.fromEntries(
    commandMenuItemNames.map((commandMenuItemName) => [
      STANDARD_COMMAND_MENU_ITEMS[commandMenuItemName].universalIdentifier,
      createStandardCommandMenuItemFlatMetadata({
        commandMenuItemName,
        commandMenuItemId: `${commandMenuItemName}-id`,
        workspaceId: WORKSPACE_ID,
        twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
        dependencyFlatEntityMaps: {
          flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
        },
        now: NOW,
      }),
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

describe('buildMissingStandardPinnedCommandsToCreate', () => {
  it('should pin Search and New chat on a workspace that has neither', () => {
    const flatNavigationMenuItems = buildMissingStandardPinnedCommandsToCreate({
      flatNavigationMenuItemMaps: buildFlatNavigationMenuItemMaps([]),
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
        'searchRecords',
        'newAiChat',
      ]),
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
      now: NOW,
    });

    expect(
      flatNavigationMenuItems.map(
        ({ universalIdentifier, commandMenuItemId, parentId, position }) => ({
          universalIdentifier,
          commandMenuItemId,
          parentId,
          position,
        }),
      ),
    ).toEqual([
      {
        universalIdentifier:
          STANDARD_NAVIGATION_MENU_ITEMS.searchCommand.universalIdentifier,
        commandMenuItemId: 'searchRecords-id',
        parentId: null,
        position: 0,
      },
      {
        universalIdentifier:
          STANDARD_NAVIGATION_MENU_ITEMS.newAiChatCommand.universalIdentifier,
        commandMenuItemId: 'newAiChat-id',
        parentId: null,
        position: 1,
      },
    ]);
  });

  it('should leave out a pinned command the workspace already has, hidden or not', () => {
    const flatCommandMenuItemMaps = buildFlatCommandMenuItemMaps([
      'searchRecords',
      'newAiChat',
    ]);
    const hiddenSearchCommand = createStandardNavigationMenuItemCommandFlatMetadata(
      {
        universalIdentifier:
          STANDARD_NAVIGATION_MENU_ITEMS.searchCommand.universalIdentifier,
        commandMenuItemUniversalIdentifier:
          STANDARD_COMMAND_MENU_ITEMS.searchRecords.universalIdentifier,
        position: 0,
        navigationMenuItemId: 'existing-search-command-id',
        workspaceId: WORKSPACE_ID,
        twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
        dependencyFlatEntityMaps: { flatCommandMenuItemMaps },
        now: NOW,
      },
    );

    const flatNavigationMenuItems = buildMissingStandardPinnedCommandsToCreate({
      flatNavigationMenuItemMaps: buildFlatNavigationMenuItemMaps(
        hiddenSearchCommand ? [{ ...hiddenSearchCommand, isActive: false }] : [],
      ),
      flatCommandMenuItemMaps,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
      now: NOW,
    });

    expect(
      flatNavigationMenuItems.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual([
      STANDARD_NAVIGATION_MENU_ITEMS.newAiChatCommand.universalIdentifier,
    ]);
  });

  it('should skip a pinned command whose command the workspace does not have', () => {
    const flatNavigationMenuItems = buildMissingStandardPinnedCommandsToCreate({
      flatNavigationMenuItemMaps: buildFlatNavigationMenuItemMaps([]),
      flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps(['searchRecords']),
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
      now: NOW,
    });

    expect(
      flatNavigationMenuItems.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual([STANDARD_NAVIGATION_MENU_ITEMS.searchCommand.universalIdentifier]);
  });
});
