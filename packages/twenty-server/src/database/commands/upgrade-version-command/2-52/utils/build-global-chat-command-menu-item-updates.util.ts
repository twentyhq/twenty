import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';
import { isDefined, typedObjectEntries } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const NEW_AI_CHAT_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.newAiChat.universalIdentifier;
const OPEN_AI_CHAT_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.viewPreviousAiChats.universalIdentifier;
const AGENT_CHAT_THREAD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThread.universalIdentifier;
const PREVIOUS_NEW_CHAT_AVAILABILITY_EXPRESSION =
  'numberOfSelectedRecords == 1 and pageType == "RECORD_PAGE" and not isInSidePanel and permissionFlags.AI';
const NEW_CHAT_PINNED_EXPRESSION =
  'pageType == "RECORD_PAGE" and objectMetadataItem.nameSingular == "agentChatThread" and not isInSidePanel';

export const buildGlobalChatCommandMenuItemUpdates = ({
  flatCommandMenuItemMaps,
  flatObjectMetadataMaps,
  direction,
  now,
}: {
  flatCommandMenuItemMaps: FlatEntityMaps<FlatCommandMenuItem>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  direction: 'up' | 'down';
  now: string;
}): FlatCommandMenuItem[] => {
  const chatObjectMetadata =
    flatObjectMetadataMaps.byUniversalIdentifier[
      AGENT_CHAT_THREAD_UNIVERSAL_IDENTIFIER
    ];
  const isUpgrade = direction === 'up';
  const updates: {
    universalIdentifier: string;
    target: Partial<FlatCommandMenuItem>;
  }[] = [
    {
      universalIdentifier: OPEN_AI_CHAT_UNIVERSAL_IDENTIFIER,
      target: {
        label: isUpgrade ? 'Open chat' : 'View Previous AI Chats',
        shortLabel: isUpgrade ? 'Open chat' : 'Previous AI Chats',
        icon: isUpgrade ? 'IconMessage' : 'IconHistory',
      },
    },
  ];

  if (isUpgrade || isDefined(chatObjectMetadata)) {
    updates.push({
      universalIdentifier: NEW_AI_CHAT_UNIVERSAL_IDENTIFIER,
      target: {
        availabilityType: isUpgrade
          ? CommandMenuItemAvailabilityType.GLOBAL
          : CommandMenuItemAvailabilityType.RECORD_SELECTION,
        conditionalAvailabilityExpression: isUpgrade
          ? 'permissionFlags.AI'
          : PREVIOUS_NEW_CHAT_AVAILABILITY_EXPRESSION,
        conditionalPinnedExpression: isUpgrade
          ? NEW_CHAT_PINNED_EXPRESSION
          : null,
        availabilityObjectMetadataId: isUpgrade
          ? null
          : (chatObjectMetadata?.id ?? null),
        availabilityObjectMetadataUniversalIdentifier: isUpgrade
          ? null
          : AGENT_CHAT_THREAD_UNIVERSAL_IDENTIFIER,
      },
    });
  }

  return updates.flatMap(({ universalIdentifier, target }) => {
    const commandMenuItem =
      flatCommandMenuItemMaps.byUniversalIdentifier[universalIdentifier];

    if (
      !isDefined(commandMenuItem) ||
      commandMenuItem.applicationUniversalIdentifier !==
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
    ) {
      return [];
    }

    const isAlreadyUpdated = typedObjectEntries(target).every(
      ([key, value]) => commandMenuItem[key] === value,
    );

    if (isAlreadyUpdated) {
      return [];
    }

    return [{ ...commandMenuItem, ...target, updatedAt: now }];
  });
};
