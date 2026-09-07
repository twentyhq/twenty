import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const LEGACY_EXPRESSION =
  'numberOfSelectedRecords >= 1 and everyEquals(selectedRecords, "status", "DRAFT") and noneDefined(selectedRecords, "deletedAt")';

const SEND_COMMAND_KEYS = [
  'sendMessageCampaign',
  'sendMessageCampaignTest',
] as const;

export const buildSendMessageCampaignAvailabilityUpdates = ({
  flatCommandMenuItemByUniversalIdentifier,
  now,
}: {
  flatCommandMenuItemByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
  now: string;
}): FlatCommandMenuItem[] => {
  const updates: FlatCommandMenuItem[] = [];

  for (const commandKey of SEND_COMMAND_KEYS) {
    const standardCommandMenuItem = STANDARD_COMMAND_MENU_ITEMS[commandKey];
    const existingCommandMenuItem =
      flatCommandMenuItemByUniversalIdentifier[
        standardCommandMenuItem.universalIdentifier
      ];

    if (!isDefined(existingCommandMenuItem)) {
      continue;
    }

    if (
      existingCommandMenuItem.conditionalAvailabilityExpression !==
      LEGACY_EXPRESSION
    ) {
      continue;
    }

    updates.push({
      ...existingCommandMenuItem,
      conditionalAvailabilityExpression:
        standardCommandMenuItem.conditionalAvailabilityExpression,
      updatedAt: now,
    });
  }

  return updates;
};
