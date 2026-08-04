import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntityToCreateDeleteUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

export const LEGACY_DISCARD_DRAFT_WORKFLOW_AVAILABILITY_EXPRESSION =
  'every(selectedRecords, "versions.length") and everyEquals(selectedRecords, "currentVersion.status", "DRAFT") and noneDefined(selectedRecords, "deletedAt")';

const DISCARD_DRAFT_WORKFLOW_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.discardDraftWorkflow.universalIdentifier;

const DISCARD_DRAFT_WORKFLOW_AVAILABILITY_EXPRESSION =
  STANDARD_COMMAND_MENU_ITEMS.discardDraftWorkflow
    .conditionalAvailabilityExpression;

export const buildSyncDiscardDraftWorkflowAvailabilityExpressionSyncOperations =
  ({
    existingFlatCommandMenuItemMaps,
    now,
  }: {
    existingFlatCommandMenuItemMaps: FlatEntityMaps<FlatCommandMenuItem>;
    now: string;
  }): FlatEntityToCreateDeleteUpdate<'commandMenuItem'> => {
    const existingDiscardDraftWorkflowCommandMenuItem =
      existingFlatCommandMenuItemMaps.byUniversalIdentifier[
        DISCARD_DRAFT_WORKFLOW_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER
      ];

    if (
      !isDefined(existingDiscardDraftWorkflowCommandMenuItem) ||
      existingDiscardDraftWorkflowCommandMenuItem.conditionalAvailabilityExpression !==
        LEGACY_DISCARD_DRAFT_WORKFLOW_AVAILABILITY_EXPRESSION
    ) {
      return {
        flatEntityToCreate: [],
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      };
    }

    return {
      flatEntityToCreate: [],
      flatEntityToDelete: [],
      flatEntityToUpdate: [
        {
          ...existingDiscardDraftWorkflowCommandMenuItem,
          conditionalAvailabilityExpression:
            DISCARD_DRAFT_WORKFLOW_AVAILABILITY_EXPRESSION,
          updatedAt: now,
        },
      ],
    };
  };
