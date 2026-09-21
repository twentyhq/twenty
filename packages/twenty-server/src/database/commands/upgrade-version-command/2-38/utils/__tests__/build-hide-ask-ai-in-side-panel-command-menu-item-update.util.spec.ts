import { buildHideAskAiInSidePanelCommandMenuItemUpdate } from 'src/database/commands/upgrade-version-command/2-38/utils/build-hide-ask-ai-in-side-panel-command-menu-item-update.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { createStandardCommandMenuItemFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/command-menu-item/create-standard-command-menu-item-flat-metadata.util';

const NOW = '2026-09-01T12:00:00.000Z';
const LEGACY_COMMAND_MENU_ITEM: FlatCommandMenuItem = Object.freeze({
  ...createStandardCommandMenuItemFlatMetadata({
    commandMenuItemName: 'askAi',
    commandMenuItemId: 'ask-ai-command-id',
    workspaceId: 'workspace-id',
    twentyStandardApplicationId: 'application-id',
    dependencyFlatEntityMaps: {
      flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
    },
    now: '2026-08-01T00:00:00.000Z',
  }),
  conditionalAvailabilityExpression: 'permissionFlags.AI',
});

describe('buildHideAskAiInSidePanelCommandMenuItemUpdate', () => {
  it('updates the legacy availability expression to the standard definition', () => {
    expect(
      buildHideAskAiInSidePanelCommandMenuItemUpdate({
        existingCommandMenuItem: LEGACY_COMMAND_MENU_ITEM,
        now: NOW,
      }),
    ).toEqual({
      ...LEGACY_COMMAND_MENU_ITEM,
      conditionalAvailabilityExpression:
        STANDARD_COMMAND_MENU_ITEMS.askAi.conditionalAvailabilityExpression,
      updatedAt: NOW,
    });
  });

  it('keeps the migrated expression synchronized with the standard definition', () => {
    expect(
      STANDARD_COMMAND_MENU_ITEMS.askAi.conditionalAvailabilityExpression,
    ).toBe('permissionFlags.AI and not isInSidePanel');
  });

  it.each([
    { name: 'missing command', existingCommandMenuItem: undefined },
    {
      name: 'custom availability expression',
      existingCommandMenuItem: {
        ...LEGACY_COMMAND_MENU_ITEM,
        conditionalAvailabilityExpression:
          'permissionFlags.AI and objectPermissions.canReadObjectRecords',
      },
    },
    {
      name: 'already migrated command',
      existingCommandMenuItem: {
        ...LEGACY_COMMAND_MENU_ITEM,
        conditionalAvailabilityExpression:
          STANDARD_COMMAND_MENU_ITEMS.askAi.conditionalAvailabilityExpression,
      },
    },
  ])('skips $name', ({ existingCommandMenuItem }) => {
    expect(
      buildHideAskAiInSidePanelCommandMenuItemUpdate({
        existingCommandMenuItem,
        now: NOW,
      }),
    ).toBeUndefined();
  });
});
