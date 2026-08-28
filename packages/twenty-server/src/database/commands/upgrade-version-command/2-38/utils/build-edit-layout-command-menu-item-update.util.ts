import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const LEGACY_EDIT_LAYOUT_AVAILABILITY_EXPRESSION =
  'pageType == "RECORD_PAGE" and not isLayoutCustomizationModeEnabled and noneDefined(selectedRecords, "deletedAt") and objectPermissions.canUpdateObjectRecords and objectMetadataItem.nameSingular != "dashboard"';

export const buildEditLayoutCommandMenuItemUpdate = ({
  existingCommandMenuItem,
  now,
}: {
  existingCommandMenuItem: FlatCommandMenuItem | undefined;
  now: string;
}): FlatCommandMenuItem | undefined => {
  if (
    !isDefined(existingCommandMenuItem) ||
    existingCommandMenuItem.availabilityType !==
      CommandMenuItemAvailabilityType.RECORD_SELECTION ||
    existingCommandMenuItem.conditionalAvailabilityExpression !==
      LEGACY_EDIT_LAYOUT_AVAILABILITY_EXPRESSION
  ) {
    return undefined;
  }

  const standardCommandMenuItem = STANDARD_COMMAND_MENU_ITEMS.editRecordPageLayout;

  return {
    ...existingCommandMenuItem,
    availabilityType: standardCommandMenuItem.availabilityType,
    conditionalAvailabilityExpression:
      standardCommandMenuItem.conditionalAvailabilityExpression,
    updatedAt: now,
  };
};
