import { isDefined } from 'twenty-shared/utils';

import { getStandardCommandMenuItemConditionalAvailabilityExpression } from 'src/database/commands/upgrade-version-command/utils/get-standard-command-menu-item-conditional-availability-expression.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const LEGACY_ASK_AI_AVAILABILITY_EXPRESSION = 'permissionFlags.AI';

export const buildHideAskAiInSidePanelCommandMenuItemUpdate = ({
  existingCommandMenuItem,
  now,
}: {
  existingCommandMenuItem: FlatCommandMenuItem | undefined;
  now: string;
}): FlatCommandMenuItem | undefined => {
  if (
    !isDefined(existingCommandMenuItem) ||
    existingCommandMenuItem.conditionalAvailabilityExpression !==
      LEGACY_ASK_AI_AVAILABILITY_EXPRESSION
  ) {
    return undefined;
  }

  return {
    ...existingCommandMenuItem,
    conditionalAvailabilityExpression:
      getStandardCommandMenuItemConditionalAvailabilityExpression(
        STANDARD_COMMAND_MENU_ITEMS.askAi.universalIdentifier,
      ),
    updatedAt: now,
  };
};
