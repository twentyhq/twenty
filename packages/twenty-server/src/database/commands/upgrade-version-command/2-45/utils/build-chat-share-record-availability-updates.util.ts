import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const CHAT_SHARING_FLAG_EXPRESSION =
  'numberOfSelectedRecords == 1 and featureFlags.IS_AI_CHAT_SHARING_DROPDOWN_ENABLED and noneDefined(selectedRecords, "deletedAt")';

export const CHAT_OR_RECORD_SHARING_FLAG_EXPRESSION =
  'numberOfSelectedRecords == 1 and (featureFlags.IS_AI_CHAT_SHARING_DROPDOWN_ENABLED or featureFlags.IS_RECORD_LEVEL_SHARING_ENABLED) and noneDefined(selectedRecords, "deletedAt")';

// Only an item still holding the expression it shipped with is moved, so a
// workspace that customized the chat Share item keeps its version
export const buildChatShareRecordAvailabilityUpdates = ({
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
}): FlatCommandMenuItem[] => {
  const shareRecord =
    flatCommandMenuItemsByUniversalIdentifier[
      STANDARD_COMMAND_MENU_ITEMS.shareRecord.universalIdentifier
    ];
  const [fromExpression, toExpression] =
    direction === 'up'
      ? [CHAT_SHARING_FLAG_EXPRESSION, CHAT_OR_RECORD_SHARING_FLAG_EXPRESSION]
      : [CHAT_OR_RECORD_SHARING_FLAG_EXPRESSION, CHAT_SHARING_FLAG_EXPRESSION];

  return shareRecord?.conditionalAvailabilityExpression === fromExpression
    ? [
        {
          ...shareRecord,
          conditionalAvailabilityExpression: toExpression,
          updatedAt: now,
        },
      ]
    : [];
};
