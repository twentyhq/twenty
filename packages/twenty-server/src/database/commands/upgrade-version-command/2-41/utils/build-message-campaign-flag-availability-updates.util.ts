import { isNonEmptyString } from '@sniptt/guards';
import {
  getSystemNavigationCommandMenuItemUniversalIdentifier,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const PREVIOUS_FLAG_EXPRESSION = 'featureFlags.IS_EMAIL_GROUP_ENABLED';

const NEXT_FLAG_EXPRESSION = 'featureFlags.IS_MESSAGE_CAMPAIGN_ENABLED';

const MESSAGE_CAMPAIGN_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS = [
  STANDARD_COMMAND_MENU_ITEMS.composeCampaign.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.composeCampaignPinned.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaignTest.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.cancelMessageCampaign.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.duplicateMessageCampaign.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.duplicateMessageList.universalIdentifier,
  ...[
    STANDARD_OBJECTS.messageCampaign.universalIdentifier,
    STANDARD_OBJECTS.messageList.universalIdentifier,
  ].map((objectUniversalIdentifier) =>
    getSystemNavigationCommandMenuItemUniversalIdentifier({
      objectMetadataApplicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      objectUniversalIdentifier,
    }),
  ),
];

export const buildMessageCampaignFlagAvailabilityUpdates = ({
  flatCommandMenuItemByUniversalIdentifier,
  now,
}: {
  flatCommandMenuItemByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
  now: string;
}): FlatCommandMenuItem[] =>
  MESSAGE_CAMPAIGN_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.flatMap(
    (universalIdentifier) => {
      const existingCommandMenuItem =
        flatCommandMenuItemByUniversalIdentifier[universalIdentifier];

      const existingExpression =
        existingCommandMenuItem?.conditionalAvailabilityExpression;

      if (
        !isDefined(existingCommandMenuItem) ||
        !isNonEmptyString(existingExpression) ||
        !existingExpression.includes(PREVIOUS_FLAG_EXPRESSION)
      ) {
        return [];
      }

      return [
        {
          ...existingCommandMenuItem,
          conditionalAvailabilityExpression: existingExpression
            .split(PREVIOUS_FLAG_EXPRESSION)
            .join(NEXT_FLAG_EXPRESSION),
          updatedAt: now,
        },
      ];
    },
  );
