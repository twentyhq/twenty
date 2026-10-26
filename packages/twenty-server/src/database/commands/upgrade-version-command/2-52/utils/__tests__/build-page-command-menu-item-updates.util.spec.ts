import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { buildPageCommandMenuItemUpdates } from 'src/database/commands/upgrade-version-command/2-52/utils/build-page-command-menu-item-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { createStandardCommandMenuItemFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/command-menu-item/create-standard-command-menu-item-flat-metadata.util';

const NOW = '2026-10-26T12:00:00.000Z';
const CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-3333-4333-8333-333333333333';
const DASHBOARD_OBJECT_METADATA = getFlatObjectMetadataMock({
  id: 'dashboard-object-id',
  universalIdentifier: STANDARD_OBJECTS.dashboard.universalIdentifier,
});

const buildStandardCommandMenuItem = (
  commandMenuItemName:
    | 'editRecordPageLayout'
    | 'saveDashboardLayout'
    | 'cancelDashboardLayout',
): FlatCommandMenuItem =>
  createStandardCommandMenuItemFlatMetadata({
    commandMenuItemName,
    commandMenuItemId: `${commandMenuItemName}-id`,
    workspaceId: 'workspace-id',
    twentyStandardApplicationId: 'application-id',
    dependencyFlatEntityMaps: {
      flatObjectMetadataMaps: {
        ...createEmptyFlatEntityMaps(),
        byUniversalIdentifier: {
          [DASHBOARD_OBJECT_METADATA.universalIdentifier]:
            DASHBOARD_OBJECT_METADATA,
        },
      },
    },
    now: '2026-10-01T00:00:00.000Z',
  });

const EDIT_LAYOUT = buildStandardCommandMenuItem('editRecordPageLayout');
const SAVE_DASHBOARD: FlatCommandMenuItem = {
  ...buildStandardCommandMenuItem('saveDashboardLayout'),
  isPinLocked: false,
};
const CANCEL_DASHBOARD: FlatCommandMenuItem = {
  ...buildStandardCommandMenuItem('cancelDashboardLayout'),
  isPinLocked: false,
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
  EDIT_LAYOUT,
  SAVE_DASHBOARD,
  CANCEL_DASHBOARD,
]);

describe('buildPageCommandMenuItemUpdates', () => {
  it('locks the dashboard Save and Cancel pins as new workspaces have them', () => {
    expect(
      buildPageCommandMenuItemUpdates({
        flatCommandMenuItemMaps: PREVIOUS_FLAT_COMMAND_MENU_ITEM_MAPS,
        direction: 'up',
        now: NOW,
      }),
    ).toEqual([
      {
        ...buildStandardCommandMenuItem('saveDashboardLayout'),
        updatedAt: NOW,
      },
      {
        ...buildStandardCommandMenuItem('cancelDashboardLayout'),
        updatedAt: NOW,
      },
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

  it('unlocks the dashboard commands on down', () => {
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
            ...SAVE_DASHBOARD,
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
