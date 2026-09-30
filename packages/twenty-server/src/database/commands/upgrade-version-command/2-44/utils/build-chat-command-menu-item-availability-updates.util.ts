import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

const RECORD_NAVIGATION_PREVIOUS_EXPRESSION =
  'pageType == "RECORD_PAGE" and not isInSidePanel and objectMetadataItem.nameSingular != "messageCampaign"';
const RECORD_NAVIGATION_NEXT_EXPRESSION =
  'pageType == "RECORD_PAGE" and not isInSidePanel and objectMetadataItem.nameSingular != "messageCampaign" and objectMetadataItem.nameSingular != "agentChatThread"';

// The chat page is a chat's record page, where the chat's own New chat
// command replaces Ask AI and there is no record list to page through. A chat
// shared read-only must not offer deletion, so deletion reads the per-record
// permissions the client puts on the selected records
const EXPRESSIONS_BY_UNIVERSAL_IDENTIFIER: Record<
  string,
  { previous: string; next: string }
> = {
  // navigateToNextRecord
  '3db2457d-8e96-4b8e-94c9-ed95d3f95738': {
    previous: RECORD_NAVIGATION_PREVIOUS_EXPRESSION,
    next: RECORD_NAVIGATION_NEXT_EXPRESSION,
  },
  // navigateToPreviousRecord
  'ec10f871-415b-420b-8150-7e09f6f04833': {
    previous: RECORD_NAVIGATION_PREVIOUS_EXPRESSION,
    next: RECORD_NAVIGATION_NEXT_EXPRESSION,
  },
  // deleteRecords
  'd5a55d57-ed1d-4791-89b8-53b7e121d69d': {
    previous:
      'numberOfSelectedRecords >= 1 and not hasAnySoftDeleteFilterOnView and objectPermissions.canSoftDeleteObjectRecords and (isSelectAll or noneDefined(selectedRecords, "deletedAt"))',
    next: 'numberOfSelectedRecords >= 1 and not hasAnySoftDeleteFilterOnView and objectPermissions.canSoftDeleteObjectRecords and (isSelectAll or noneDefined(selectedRecords, "deletedAt")) and (isSelectAll or noneEquals(selectedRecords, "recordPermissions.canSoftDelete", false))',
  },
  // restoreRecords
  '2d733846-8cc5-4314-ab79-916ae0801baa': {
    previous:
      'numberOfSelectedRecords >= 1 and (isSelectAll or everyDefined(selectedRecords, "deletedAt")) and objectPermissions.canSoftDeleteObjectRecords and (pageType == "RECORD_PAGE" or hasAnySoftDeleteFilterOnView)',
    next: 'numberOfSelectedRecords >= 1 and (isSelectAll or everyDefined(selectedRecords, "deletedAt")) and objectPermissions.canSoftDeleteObjectRecords and (pageType == "RECORD_PAGE" or hasAnySoftDeleteFilterOnView) and (isSelectAll or noneEquals(selectedRecords, "recordPermissions.canSoftDelete", false))',
  },
  // destroyRecords
  '0ea2ebc4-02ca-4d15-b424-5352b9e487df': {
    previous:
      'numberOfSelectedRecords >= 1 and objectPermissions.canDestroyObjectRecords and (isSelectAll or everyDefined(selectedRecords, "deletedAt")) and (pageType == "RECORD_PAGE" or hasAnySoftDeleteFilterOnView)',
    next: 'numberOfSelectedRecords >= 1 and objectPermissions.canDestroyObjectRecords and (isSelectAll or everyDefined(selectedRecords, "deletedAt")) and (pageType == "RECORD_PAGE" or hasAnySoftDeleteFilterOnView) and (isSelectAll or noneEquals(selectedRecords, "recordPermissions.canDelete", false))',
  },
  // askAi
  'ce5fb54d-2b19-4dd1-b7b4-9532a1761a41': {
    previous: 'permissionFlags.AI and not isInSidePanel',
    next: 'permissionFlags.AI and not isInSidePanel and objectMetadataItem.nameSingular != "agentChatThread"',
  },
};

export const buildChatCommandMenuItemAvailabilityUpdates = ({
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
  Object.entries(EXPRESSIONS_BY_UNIVERSAL_IDENTIFIER).flatMap(
    ([universalIdentifier, { previous, next }]) => {
      const commandMenuItem =
        flatCommandMenuItemsByUniversalIdentifier[universalIdentifier];
      const [fromExpression, toExpression] =
        direction === 'up' ? [previous, next] : [next, previous];

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
