import { buildPageCommandMenuItemUpdates } from 'src/database/commands/upgrade-version-command/2-52/utils/build-page-command-menu-item-updates.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { createStandardCommandMenuItemFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/command-menu-item/create-standard-command-menu-item-flat-metadata.util';

const NOW = '2026-10-26T12:00:00.000Z';
const CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-3333-4333-8333-333333333333';
const ASK_AI_PINNED_EXPRESSION = 'pageType != "SETTINGS_PAGE"';

const SAVE_DASHBOARD_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.saveDashboardLayout.universalIdentifier;
const CANCEL_DASHBOARD_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.cancelDashboardLayout.universalIdentifier;

const buildGlobalStandardCommandMenuItem = (
  commandMenuItemName: 'askAi' | 'editRecordPageLayout',
): FlatCommandMenuItem =>
  createStandardCommandMenuItemFlatMetadata({
    commandMenuItemName,
    commandMenuItemId: `${commandMenuItemName}-id`,
    workspaceId: 'workspace-id',
    twentyStandardApplicationId: 'application-id',
    dependencyFlatEntityMaps: {
      flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
    },
    now: '2026-10-01T00:00:00.000Z',
  });

const ASK_AI: FlatCommandMenuItem = {
  ...buildGlobalStandardCommandMenuItem('askAi'),
  conditionalPinnedExpression: null,
  overrides: {
    [CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: { position: 2 },
  },
  universalOverrides: {
    [CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: { position: 2 },
  },
};
const EDIT_LAYOUT: FlatCommandMenuItem = buildGlobalStandardCommandMenuItem(
  'editRecordPageLayout',
);
const SAVE_DASHBOARD: FlatCommandMenuItem = {
  ...EDIT_LAYOUT,
  id: 'save-dashboard-id',
  universalIdentifier: SAVE_DASHBOARD_UNIVERSAL_IDENTIFIER,
  label: 'Save Dashboard',
  isPinned: true,
  isPinLocked: false,
  engineComponentKey: EngineComponentKey.SAVE_DASHBOARD_LAYOUT,
};
const CANCEL_DASHBOARD: FlatCommandMenuItem = {
  ...SAVE_DASHBOARD,
  id: 'cancel-dashboard-id',
  universalIdentifier: CANCEL_DASHBOARD_UNIVERSAL_IDENTIFIER,
  label: 'Cancel Edition',
  engineComponentKey: EngineComponentKey.CANCEL_DASHBOARD_LAYOUT,
};

const buildFlatCommandMenuItemMaps = (
  commandMenuItems: FlatCommandMenuItem[],
): FlatEntityMaps<FlatCommandMenuItem> => ({
  ...createEmptyFlatEntityMaps(),
  byUniversalIdentifier: Object.fromEntries(
    commandMenuItems.map((commandMenuItem) => [
      commandMenuItem.universalIdentifier,
      commandMenuItem,
    ]),
  ),
});

const PREVIOUS_FLAT_COMMAND_MENU_ITEM_MAPS = buildFlatCommandMenuItemMaps([
  ASK_AI,
  EDIT_LAYOUT,
  SAVE_DASHBOARD,
  CANCEL_DASHBOARD,
]);

describe('buildPageCommandMenuItemUpdates', () => {
  it('unpins Ask AI on settings pages and locks the dashboard Save and Cancel', () => {
    expect(
      buildPageCommandMenuItemUpdates({
        flatCommandMenuItemMaps: PREVIOUS_FLAT_COMMAND_MENU_ITEM_MAPS,
        direction: 'up',
        now: NOW,
      }),
    ).toEqual([
      {
        ...ASK_AI,
        conditionalPinnedExpression: ASK_AI_PINNED_EXPRESSION,
        updatedAt: NOW,
      },
      { ...SAVE_DASHBOARD, isPinLocked: true, updatedAt: NOW },
      { ...CANCEL_DASHBOARD, isPinLocked: true, updatedAt: NOW },
    ]);
  });

  it('leaves already migrated commands unchanged', () => {
    const migratedCommandMenuItems = buildPageCommandMenuItemUpdates({
      flatCommandMenuItemMaps: PREVIOUS_FLAT_COMMAND_MENU_ITEM_MAPS,
      direction: 'up',
      now: NOW,
    });

    expect(
      buildPageCommandMenuItemUpdates({
        flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps(
          migratedCommandMenuItems,
        ),
        direction: 'up',
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('restores the Ask AI pinning and unlocks the dashboard commands on down', () => {
    const migratedCommandMenuItems = buildPageCommandMenuItemUpdates({
      flatCommandMenuItemMaps: PREVIOUS_FLAT_COMMAND_MENU_ITEM_MAPS,
      direction: 'up',
      now: NOW,
    });

    expect(
      buildPageCommandMenuItemUpdates({
        flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps(
          migratedCommandMenuItems,
        ),
        direction: 'down',
        now: NOW,
      }),
    ).toEqual([
      { ...ASK_AI, updatedAt: NOW },
      { ...SAVE_DASHBOARD, updatedAt: NOW },
      { ...CANCEL_DASHBOARD, updatedAt: NOW },
    ]);
  });

  it('locks a dashboard command a workspace unpinned without pinning it again', () => {
    expect(
      buildPageCommandMenuItemUpdates({
        flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
          { ...SAVE_DASHBOARD, isPinned: false },
        ]),
        direction: 'up',
        now: NOW,
      }),
    ).toEqual([
      expect.objectContaining({
        universalIdentifier: SAVE_DASHBOARD.universalIdentifier,
        isPinned: false,
        isPinLocked: true,
      }),
    ]);
  });

  it('skips missing commands and commands owned by another application', () => {
    expect(
      buildPageCommandMenuItemUpdates({
        flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps([
          {
            ...ASK_AI,
            applicationUniversalIdentifier:
              CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
          },
        ]),
        direction: 'up',
        now: NOW,
      }),
    ).toEqual([]);
  });
});
