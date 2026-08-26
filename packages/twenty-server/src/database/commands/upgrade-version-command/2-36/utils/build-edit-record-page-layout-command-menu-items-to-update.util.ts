import { isDefined } from 'twenty-shared/utils';

import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const LEGACY_EDIT_RECORD_PAGE_LAYOUT_AVAILABILITY_EXPRESSION =
  'pageType == "RECORD_PAGE" and not isLayoutCustomizationModeEnabled and noneDefined(selectedRecords, "deletedAt") and objectPermissions.canUpdateObjectRecords and objectMetadataItem.nameSingular != "dashboard"';

const EDIT_RECORD_PAGE_LAYOUT_COMMAND_MENU_ITEM =
  STANDARD_COMMAND_MENU_ITEMS.editRecordPageLayout;

export const buildEditRecordPageLayoutCommandMenuItemsToUpdate = ({
  existingFlatCommandMenuItemMaps,
  now,
}: {
  existingFlatCommandMenuItemMaps: FlatEntityMaps<FlatCommandMenuItem>;
  now: string;
}): FlatCommandMenuItem[] => {
  const existingCommandMenuItem =
    existingFlatCommandMenuItemMaps.byUniversalIdentifier[
      EDIT_RECORD_PAGE_LAYOUT_COMMAND_MENU_ITEM.universalIdentifier
    ];

  if (!isDefined(existingCommandMenuItem)) {
    return [];
  }

  const hasSyncableAvailabilityType =
    existingCommandMenuItem.availabilityType ===
      CommandMenuItemAvailabilityType.RECORD_SELECTION ||
    existingCommandMenuItem.availabilityType ===
      EDIT_RECORD_PAGE_LAYOUT_COMMAND_MENU_ITEM.availabilityType;
  const hasSyncableAvailabilityExpression =
    existingCommandMenuItem.conditionalAvailabilityExpression ===
      LEGACY_EDIT_RECORD_PAGE_LAYOUT_AVAILABILITY_EXPRESSION ||
    existingCommandMenuItem.conditionalAvailabilityExpression ===
      EDIT_RECORD_PAGE_LAYOUT_COMMAND_MENU_ITEM.conditionalAvailabilityExpression;
  const isAlreadySynced =
    existingCommandMenuItem.availabilityType ===
      EDIT_RECORD_PAGE_LAYOUT_COMMAND_MENU_ITEM.availabilityType &&
    existingCommandMenuItem.conditionalAvailabilityExpression ===
      EDIT_RECORD_PAGE_LAYOUT_COMMAND_MENU_ITEM.conditionalAvailabilityExpression;

  if (
    !hasSyncableAvailabilityType ||
    !hasSyncableAvailabilityExpression ||
    isAlreadySynced
  ) {
    return [];
  }

  return [
    {
      ...existingCommandMenuItem,
      availabilityType:
        EDIT_RECORD_PAGE_LAYOUT_COMMAND_MENU_ITEM.availabilityType,
      conditionalAvailabilityExpression:
        EDIT_RECORD_PAGE_LAYOUT_COMMAND_MENU_ITEM.conditionalAvailabilityExpression,
      updatedAt: now,
    },
  ];
};
