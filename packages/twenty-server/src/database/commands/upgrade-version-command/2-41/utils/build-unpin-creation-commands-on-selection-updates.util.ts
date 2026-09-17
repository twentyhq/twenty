import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const CREATION_COMMAND_MENU_ITEMS = [
  STANDARD_COMMAND_MENU_ITEMS.createNewRecord,
  STANDARD_COMMAND_MENU_ITEMS.composeCampaignPinned,
];

export const buildUnpinCreationCommandsOnSelectionUpdates = ({
  flatCommandMenuItemByUniversalIdentifier,
  now,
}: {
  flatCommandMenuItemByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
  now: string;
}): FlatCommandMenuItem[] =>
  CREATION_COMMAND_MENU_ITEMS.flatMap(
    ({ universalIdentifier, conditionalPinnedExpression }) => {
      const existingCommandMenuItem =
        flatCommandMenuItemByUniversalIdentifier[universalIdentifier];

      if (
        !isDefined(existingCommandMenuItem) ||
        isDefined(existingCommandMenuItem.conditionalPinnedExpression)
      ) {
        return [];
      }

      return [
        {
          ...existingCommandMenuItem,
          conditionalPinnedExpression,
          updatedAt: now,
        },
      ];
    },
  );
