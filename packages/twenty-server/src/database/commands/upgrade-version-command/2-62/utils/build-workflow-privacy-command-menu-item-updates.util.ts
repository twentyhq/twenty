import { isDefined } from 'twenty-shared/utils';

import { WORKFLOW_PRIVACY_COMMAND_MENU_ITEM_EXPRESSIONS } from 'src/database/commands/upgrade-version-command/2-62/constants/move-workflow-privacy-command-menu-items-to-is-private.constant';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

export const buildWorkflowPrivacyCommandMenuItemUpdates = ({
  flatCommandMenuItemsByUniversalIdentifier,
  now,
}: {
  flatCommandMenuItemsByUniversalIdentifier: Partial<
    Record<string, FlatCommandMenuItem>
  >;
  now: string;
}): FlatCommandMenuItem[] =>
  WORKFLOW_PRIVACY_COMMAND_MENU_ITEM_EXPRESSIONS.flatMap(
    ({ universalIdentifier, legacyExpression, expression }) => {
      const commandMenuItem =
        flatCommandMenuItemsByUniversalIdentifier[universalIdentifier];

      if (
        !isDefined(commandMenuItem) ||
        commandMenuItem.conditionalAvailabilityExpression !== legacyExpression
      ) {
        return [];
      }

      return [
        {
          ...commandMenuItem,
          conditionalAvailabilityExpression: expression,
          updatedAt: now,
        },
      ];
    },
  );
