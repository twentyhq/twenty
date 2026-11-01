import {
  getSystemNavigationCommandMenuItemUniversalIdentifier,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const MESSAGE_CAMPAIGN_FLAG = 'featureFlags.IS_MESSAGE_CAMPAIGN_ENABLED';

const getNavigationUniversalIdentifier = (objectUniversalIdentifier: string) =>
  getSystemNavigationCommandMenuItemUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier,
  });

const FLAGGED_EXPRESSION_BY_UNIVERSAL_IDENTIFIER: Record<string, string> = {
  [STANDARD_COMMAND_MENU_ITEMS.composeCampaign.universalIdentifier]:
    MESSAGE_CAMPAIGN_FLAG,
  [STANDARD_COMMAND_MENU_ITEMS.composeCampaignPinned.universalIdentifier]:
    `pageType == "INDEX_PAGE" and ${MESSAGE_CAMPAIGN_FLAG}`,
  [STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign.universalIdentifier]:
    `numberOfSelectedRecords == 1 and (everyEquals(selectedRecords, "status", "DRAFT") or everyEquals(selectedRecords, "status", "SCHEDULED")) and noneDefined(selectedRecords, "deletedAt") and ${MESSAGE_CAMPAIGN_FLAG}`,
  [STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaignTest.universalIdentifier]:
    `numberOfSelectedRecords == 1 and (everyEquals(selectedRecords, "status", "DRAFT") or everyEquals(selectedRecords, "status", "SCHEDULED")) and noneDefined(selectedRecords, "deletedAt") and ${MESSAGE_CAMPAIGN_FLAG}`,
  [STANDARD_COMMAND_MENU_ITEMS.cancelMessageCampaign.universalIdentifier]:
    `numberOfSelectedRecords == 1 and (everyEquals(selectedRecords, "status", "SCHEDULED") or everyEquals(selectedRecords, "status", "SENDING")) and noneDefined(selectedRecords, "deletedAt") and ${MESSAGE_CAMPAIGN_FLAG}`,
  [STANDARD_COMMAND_MENU_ITEMS.duplicateMessageCampaign.universalIdentifier]:
    `numberOfSelectedRecords == 1 and noneDefined(selectedRecords, "deletedAt") and objectPermissions.canUpdateObjectRecords and ${MESSAGE_CAMPAIGN_FLAG}`,
  [STANDARD_COMMAND_MENU_ITEMS.duplicateMessageList.universalIdentifier]:
    `${MESSAGE_CAMPAIGN_FLAG} and numberOfSelectedRecords == 1 and noneDefined(selectedRecords, "deletedAt") and objectPermissions.canUpdateObjectRecords`,
  [STANDARD_COMMAND_MENU_ITEMS.addToMessageList.universalIdentifier]:
    `${MESSAGE_CAMPAIGN_FLAG} and targetObjectWritePermissions.messageListMember and numberOfSelectedRecords >= 1 and not hasAnySoftDeleteFilterOnView and (isSelectAll or noneDefined(selectedRecords, "deletedAt"))`,
  [STANDARD_COMMAND_MENU_ITEMS.addViewToMessageList.universalIdentifier]:
    `${MESSAGE_CAMPAIGN_FLAG} and targetObjectWritePermissions.messageListMember and pageType == "INDEX_PAGE" and not hasAnySoftDeleteFilterOnView`,
  [getNavigationUniversalIdentifier(
    STANDARD_OBJECTS.messageCampaign.universalIdentifier,
  )]:
    `${MESSAGE_CAMPAIGN_FLAG} and targetObjectReadPermissions.messageCampaign`,
  [getNavigationUniversalIdentifier(
    STANDARD_OBJECTS.messageList.universalIdentifier,
  )]: `${MESSAGE_CAMPAIGN_FLAG} and targetObjectReadPermissions.messageList`,
};

const LEADING_MESSAGE_CAMPAIGN_FLAG = `${MESSAGE_CAMPAIGN_FLAG} and `;

const TRAILING_MESSAGE_CAMPAIGN_FLAG = ` and ${MESSAGE_CAMPAIGN_FLAG}`;

const getExpressionWithoutFlagOrUndefined = (
  expression: string,
): string | null | undefined => {
  if (expression === MESSAGE_CAMPAIGN_FLAG) {
    return null;
  }

  let remainingExpression: string | undefined;

  if (expression.startsWith(LEADING_MESSAGE_CAMPAIGN_FLAG)) {
    remainingExpression = expression.slice(
      LEADING_MESSAGE_CAMPAIGN_FLAG.length,
    );
  } else if (expression.endsWith(TRAILING_MESSAGE_CAMPAIGN_FLAG)) {
    remainingExpression = expression.slice(
      0,
      -TRAILING_MESSAGE_CAMPAIGN_FLAG.length,
    );
  }

  if (
    !isDefined(remainingExpression) ||
    remainingExpression.includes(MESSAGE_CAMPAIGN_FLAG)
  ) {
    return undefined;
  }

  return remainingExpression;
};

export const buildMessageCampaignFlagRemovalUpdates = ({
  flatCommandMenuItemMaps,
  direction,
  now,
}: {
  flatCommandMenuItemMaps: FlatEntityMaps<FlatCommandMenuItem>;
  direction: 'up' | 'down';
  now: string;
}): FlatCommandMenuItem[] =>
  Object.entries(FLAGGED_EXPRESSION_BY_UNIVERSAL_IDENTIFIER).flatMap(
    ([universalIdentifier, flaggedExpression]) => {
      const commandMenuItem =
        flatCommandMenuItemMaps.byUniversalIdentifier[universalIdentifier];

      if (
        !isDefined(commandMenuItem) ||
        commandMenuItem.applicationUniversalIdentifier !==
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
      ) {
        return [];
      }

      const currentExpression =
        commandMenuItem.conditionalAvailabilityExpression;

      if (direction === 'up') {
        if (!isDefined(currentExpression)) {
          return [];
        }

        const expressionWithoutFlag =
          getExpressionWithoutFlagOrUndefined(currentExpression);

        if (expressionWithoutFlag === undefined) {
          return [];
        }

        return [
          {
            ...commandMenuItem,
            conditionalAvailabilityExpression: expressionWithoutFlag,
            updatedAt: now,
          },
        ];
      }

      if (
        currentExpression !==
        getExpressionWithoutFlagOrUndefined(flaggedExpression)
      ) {
        return [];
      }

      return [
        {
          ...commandMenuItem,
          conditionalAvailabilityExpression: flaggedExpression,
          updatedAt: now,
        },
      ];
    },
  );
