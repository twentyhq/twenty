import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

export const LEGACY_DISCARD_DRAFT_WORKFLOW_AVAILABILITY_EXPRESSION =
  'every(selectedRecords, "versions.length") and everyEquals(selectedRecords, "currentVersion.status", "DRAFT") and noneDefined(selectedRecords, "deletedAt")';

const DISCARD_DRAFT_WORKFLOW_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.discardDraftWorkflow.universalIdentifier;

const DISCARD_DRAFT_WORKFLOW_AVAILABILITY_EXPRESSION =
  STANDARD_COMMAND_MENU_ITEMS.discardDraftWorkflow
    .conditionalAvailabilityExpression;

export const buildDiscardDraftWorkflowCommandMenuItemsToUpdate = ({
  existingFlatCommandMenuItemMaps,
}: {
  existingFlatCommandMenuItemMaps: FlatEntityMaps<FlatCommandMenuItem>;
}): FlatCommandMenuItem[] => {
  const existingDiscardDraftWorkflowCommandMenuItem =
    existingFlatCommandMenuItemMaps.byUniversalIdentifier[
      DISCARD_DRAFT_WORKFLOW_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER
    ];

  if (
    !isDefined(existingDiscardDraftWorkflowCommandMenuItem) ||
    existingDiscardDraftWorkflowCommandMenuItem.conditionalAvailabilityExpression !==
      LEGACY_DISCARD_DRAFT_WORKFLOW_AVAILABILITY_EXPRESSION
  ) {
    return [];
  }

  return [
    {
      ...existingDiscardDraftWorkflowCommandMenuItem,
      conditionalAvailabilityExpression:
        DISCARD_DRAFT_WORKFLOW_AVAILABILITY_EXPRESSION,
    },
  ];
};
