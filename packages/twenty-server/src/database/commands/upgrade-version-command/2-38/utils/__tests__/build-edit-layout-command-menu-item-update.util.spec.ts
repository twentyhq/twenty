import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';

import { buildEditLayoutCommandMenuItemUpdate } from 'src/database/commands/upgrade-version-command/2-38/utils/build-edit-layout-command-menu-item-update.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { createStandardCommandMenuItemFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/command-menu-item/create-standard-command-menu-item-flat-metadata.util';

const NOW = '2026-08-27T14:00:00.000Z';
const LEGACY_COMMAND_MENU_ITEM: FlatCommandMenuItem = Object.freeze({
  ...createStandardCommandMenuItemFlatMetadata({
    commandMenuItemName: 'editRecordPageLayout',
    commandMenuItemId: 'edit-layout-command-id',
    workspaceId: 'workspace-id',
    twentyStandardApplicationId: 'application-id',
    dependencyFlatEntityMaps: {
      flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
    },
    now: '2026-08-01T00:00:00.000Z',
  }),
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  conditionalAvailabilityExpression:
    'pageType == "RECORD_PAGE" and not isLayoutCustomizationModeEnabled and noneDefined(selectedRecords, "deletedAt") and objectPermissions.canUpdateObjectRecords and objectMetadataItem.nameSingular != "dashboard"',
  label: 'Customize layout',
  isPinned: true,
  position: 42,
  overrides: { label: 'Customize layout' },
  universalOverrides: { label: 'Customize layout' },
});

describe('buildEditLayoutCommandMenuItemUpdate', () => {
  it('updates legacy availability without changing other fields or mutating the input', () => {
    expect(
      buildEditLayoutCommandMenuItemUpdate({
        existingCommandMenuItem: LEGACY_COMMAND_MENU_ITEM,
        now: NOW,
      }),
    ).toEqual({
      ...LEGACY_COMMAND_MENU_ITEM,
      availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
      conditionalAvailabilityExpression:
        'pageType != "SETTINGS_PAGE" and not isLayoutCustomizationModeEnabled and permissionFlags.LAYOUTS',
      updatedAt: NOW,
    });
  });

  it.each([
    { name: 'missing command', existingCommandMenuItem: undefined },
    {
      name: 'custom availability type',
      existingCommandMenuItem: {
        ...LEGACY_COMMAND_MENU_ITEM,
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
      },
    },
    {
      name: 'custom availability expression',
      existingCommandMenuItem: {
        ...LEGACY_COMMAND_MENU_ITEM,
        conditionalAvailabilityExpression: 'false',
      },
    },
    {
      name: 'removed availability expression',
      existingCommandMenuItem: {
        ...LEGACY_COMMAND_MENU_ITEM,
        conditionalAvailabilityExpression: null,
      },
    },
  ])('skips $name', ({ existingCommandMenuItem }) => {
    expect(
      buildEditLayoutCommandMenuItemUpdate({ existingCommandMenuItem, now: NOW }),
    ).toBeUndefined();
  });

  it('does not update an already migrated command', () => {
    const updatedCommandMenuItem = buildEditLayoutCommandMenuItemUpdate({
      existingCommandMenuItem: LEGACY_COMMAND_MENU_ITEM,
      now: NOW,
    });

    expect(updatedCommandMenuItem).toBeDefined();
    expect(
      buildEditLayoutCommandMenuItemUpdate({
        existingCommandMenuItem: updatedCommandMenuItem,
        now: '2026-08-28T14:00:00.000Z',
      }),
    ).toBeUndefined();
  });
});
