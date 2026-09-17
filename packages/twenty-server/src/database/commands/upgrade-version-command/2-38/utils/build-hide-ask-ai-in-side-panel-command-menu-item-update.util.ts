import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

const LEGACY_ASK_AI_AVAILABILITY_EXPRESSION = 'permissionFlags.AI';

// Pinned rather than read off STANDARD_COMMAND_MENU_ITEMS: 2-42 frees Ask AI
// again, and a committed upgrade command has to keep doing what it did when it
// shipped whatever the constant says today.
const HIDDEN_ASK_AI_AVAILABILITY_EXPRESSION =
  'permissionFlags.AI and not isInSidePanel';

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
    conditionalAvailabilityExpression: HIDDEN_ASK_AI_AVAILABILITY_EXPRESSION,
    updatedAt: now,
  };
};
