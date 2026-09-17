import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const LEGACY_ASK_AI_AVAILABILITY_EXPRESSION =
  'permissionFlags.AI and not isInSidePanel';

export const buildAskAiCommandMenuAvailabilityUpdates = ({
  flatCommandMenuItemByUniversalIdentifier,
  now,
}: {
  flatCommandMenuItemByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
  now: string;
}): FlatCommandMenuItem[] => {
  const existingCommandMenuItem =
    flatCommandMenuItemByUniversalIdentifier[
      STANDARD_COMMAND_MENU_ITEMS.askAi.universalIdentifier
    ];

  if (
    !isDefined(existingCommandMenuItem) ||
    existingCommandMenuItem.conditionalAvailabilityExpression !==
      LEGACY_ASK_AI_AVAILABILITY_EXPRESSION
  ) {
    return [];
  }

  return [
    {
      ...existingCommandMenuItem,
      conditionalAvailabilityExpression:
        STANDARD_COMMAND_MENU_ITEMS.askAi.conditionalAvailabilityExpression,
      updatedAt: now,
    },
  ];
};
