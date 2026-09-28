import { isDefined } from 'twenty-shared/utils';

import { WORKFLOW_COMMAND_MENU_ITEM_AVAILABILITY_EXPRESSIONS } from 'src/database/commands/upgrade-version-command/2-44/constants/workflow-command-menu-item-availability-expressions.constant';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

export const buildWorkflowCommandMenuItemAvailabilityUpdates = ({
  flatCommandMenuItemsByUniversalIdentifier,
  now,
  direction,
}: {
  flatCommandMenuItemsByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
  now: string;
  direction: 'up' | 'down';
}): FlatCommandMenuItem[] =>
  Object.values(WORKFLOW_COMMAND_MENU_ITEM_AVAILABILITY_EXPRESSIONS).flatMap(
    ({ universalIdentifier, previousExpression, nextExpression }) => {
      const commandMenuItem =
        flatCommandMenuItemsByUniversalIdentifier[universalIdentifier];

      const [fromExpression, toExpression] =
        direction === 'up'
          ? [previousExpression, nextExpression]
          : [nextExpression, previousExpression];

      if (
        !isDefined(commandMenuItem) ||
        commandMenuItem.conditionalAvailabilityExpression !== fromExpression
      ) {
        return [];
      }

      return [
        {
          ...commandMenuItem,
          conditionalAvailabilityExpression: toExpression,
          updatedAt: now,
        },
      ];
    },
  );
