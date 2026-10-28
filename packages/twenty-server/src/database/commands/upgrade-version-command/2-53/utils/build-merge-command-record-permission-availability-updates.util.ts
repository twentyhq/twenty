import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { UNGATED_MERGE_AVAILABILITY_EXPRESSION } from 'src/database/commands/upgrade-version-command/2-53/utils/build-ungate-merge-command-menu-item-update.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

// Runs after the 2.53 ungate command, so it starts from the ungated expression
const PREVIOUS_MERGE_AVAILABILITY_EXPRESSION =
  UNGATED_MERGE_AVAILABILITY_EXPRESSION;
const MERGE_AVAILABILITY_EXPRESSION = `${PREVIOUS_MERGE_AVAILABILITY_EXPRESSION} and noneEquals(selectedRecords, "recordPermissions.canUpdate", false) and noneEquals(selectedRecords, "recordPermissions.canDelete", false)`;

export const buildMergeCommandRecordPermissionAvailabilityUpdates = ({
  flatCommandMenuItemMaps,
  direction,
  now,
}: {
  flatCommandMenuItemMaps: FlatEntityMaps<FlatCommandMenuItem>;
  direction: 'up' | 'down';
  now: string;
}): FlatCommandMenuItem[] => {
  const mergeCommandMenuItem =
    flatCommandMenuItemMaps.byUniversalIdentifier[
      STANDARD_COMMAND_MENU_ITEMS.mergeMultipleRecords.universalIdentifier
    ];

  const [fromExpression, toExpression] =
    direction === 'up'
      ? [PREVIOUS_MERGE_AVAILABILITY_EXPRESSION, MERGE_AVAILABILITY_EXPRESSION]
      : [MERGE_AVAILABILITY_EXPRESSION, PREVIOUS_MERGE_AVAILABILITY_EXPRESSION];

  // An expression edited since the previous release is left as the workspace set it
  if (
    !isDefined(mergeCommandMenuItem) ||
    mergeCommandMenuItem.applicationUniversalIdentifier !==
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER ||
    mergeCommandMenuItem.conditionalAvailabilityExpression !== fromExpression
  ) {
    return [];
  }

  return [
    {
      ...mergeCommandMenuItem,
      conditionalAvailabilityExpression: toExpression,
      updatedAt: now,
    },
  ];
};
