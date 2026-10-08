import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const COMMANDS_TO_WIDEN = [
  {
    standardCommandMenuItem: STANDARD_COMMAND_MENU_ITEMS.cancelMessageCampaign,
    preSchedulingExpression:
      'numberOfSelectedRecords == 1 and everyEquals(selectedRecords, "status", "SENDING") and noneDefined(selectedRecords, "deletedAt") and featureFlags.IS_EMAIL_GROUP_ENABLED',
  },
  {
    standardCommandMenuItem: STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaignTest,
    preSchedulingExpression:
      'numberOfSelectedRecords == 1 and everyEquals(selectedRecords, "status", "DRAFT") and noneDefined(selectedRecords, "deletedAt") and featureFlags.IS_EMAIL_GROUP_ENABLED',
  },
  {
    standardCommandMenuItem: STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign,
    preSchedulingExpression:
      'numberOfSelectedRecords == 1 and everyEquals(selectedRecords, "status", "DRAFT") and noneDefined(selectedRecords, "deletedAt") and featureFlags.IS_EMAIL_GROUP_ENABLED',
  },
];

export const buildMessageCampaignSchedulingAvailabilityUpdates = ({
  flatCommandMenuItemByUniversalIdentifier,
  now,
}: {
  flatCommandMenuItemByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
  now: string;
}): FlatCommandMenuItem[] =>
  COMMANDS_TO_WIDEN.flatMap(
    ({ standardCommandMenuItem, preSchedulingExpression }) => {
      const existingCommandMenuItem =
        flatCommandMenuItemByUniversalIdentifier[
          standardCommandMenuItem.universalIdentifier
        ];

      if (!isDefined(existingCommandMenuItem)) {
        return [];
      }

      if (
        existingCommandMenuItem.conditionalAvailabilityExpression !==
        preSchedulingExpression
      ) {
        return [];
      }

      return [
        {
          ...existingCommandMenuItem,
          conditionalAvailabilityExpression:
            standardCommandMenuItem.conditionalAvailabilityExpression,
          updatedAt: now,
        },
      ];
    },
  );
