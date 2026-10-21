import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const NEW_AI_CHAT_UNIVERSAL_IDENTIFIER = '604bc9b2-e438-4572-bd35-726fa0fb2ec7';
const OPEN_AI_CHAT_UNIVERSAL_IDENTIFIER =
  '3084c3c9-cc23-4dad-9e00-92025f5cba7a';
const AGENT_CHAT_THREAD_UNIVERSAL_IDENTIFIER =
  'fab0fff8-0c90-4116-9bb0-7dbc07392633';
const PREVIOUS_NEW_CHAT_AVAILABILITY_EXPRESSION =
  'numberOfSelectedRecords == 1 and pageType == "RECORD_PAGE" and not isInSidePanel and permissionFlags.AI';

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
        isPinned: false,
        availabilityType: isUpgrade
          ? CommandMenuItemAvailabilityType.GLOBAL
          : CommandMenuItemAvailabilityType.RECORD_SELECTION,
        conditionalAvailabilityExpression: isUpgrade
          ? 'permissionFlags.AI'
          : PREVIOUS_NEW_CHAT_AVAILABILITY_EXPRESSION,
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

    const isAlreadyUpdated = Object.entries(target).every(
      ([key, value]) =>
        commandMenuItem[key as keyof FlatCommandMenuItem] === value,
    );

    if (isAlreadyUpdated) {
      return [];
    }

    return [{ ...commandMenuItem, ...target, updatedAt: now }];
  });
};
