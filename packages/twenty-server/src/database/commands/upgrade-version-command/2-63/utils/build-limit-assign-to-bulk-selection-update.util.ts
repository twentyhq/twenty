import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const SINGLE_OR_BULK_ASSIGN_AVAILABILITY_EXPRESSION =
  'numberOfSelectedRecords >= 1 and permissionFlags.AI and featureFlags.IS_AI_CHAT_INBOX_ENABLED and noneDefined(selectedRecords, "deletedAt") and noneEquals(selectedRecords, "recordPermissions.canUpdate", false)';

export const buildLimitAssignToBulkSelectionUpdate = <
  TCommandMenuItem extends Pick<
    FlatCommandMenuItem,
    'conditionalAvailabilityExpression' | 'updatedAt'
  >,
>({
  flatCommandMenuItemByUniversalIdentifier,
  now,
}: {
  flatCommandMenuItemByUniversalIdentifier: Record<
    string,
    TCommandMenuItem | undefined
  >;
  now: string;
}): TCommandMenuItem[] => {
  const { universalIdentifier, conditionalAvailabilityExpression } =
    STANDARD_COMMAND_MENU_ITEMS.assignAiChat;
  const existingCommandMenuItem =
    flatCommandMenuItemByUniversalIdentifier[universalIdentifier];

  if (
    !isDefined(existingCommandMenuItem) ||
    existingCommandMenuItem.conditionalAvailabilityExpression !==
      SINGLE_OR_BULK_ASSIGN_AVAILABILITY_EXPRESSION
  ) {
    return [];
  }

  return [
    {
      ...existingCommandMenuItem,
      conditionalAvailabilityExpression,
      updatedAt: now,
    },
  ];
};
