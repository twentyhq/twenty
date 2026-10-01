import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const SHARE_RECORD_UNIVERSAL_IDENTIFIER =
  'b9336f9f-d10c-42c0-b7cd-40c94ae235ef';

const CHAT_ONLY_SHARE_RECORD_EXPRESSION =
  'numberOfSelectedRecords == 1 and featureFlags.IS_AI_CHAT_SHARING_DROPDOWN_ENABLED and noneDefined(selectedRecords, "deletedAt")';

export const ALL_OBJECTS_SHARE_RECORD_EXPRESSION =
  'numberOfSelectedRecords == 1 and noneDefined(selectedRecords, "deletedAt") and ((featureFlags.IS_RECORD_LEVEL_SHARING_ENABLED and not objectMetadataItem.isSystem and objectMetadataItem.readability != "APPLICATION" and objectMetadataItem.readability != "SYSTEM") or (objectMetadataItem.nameSingular == "agentChatThread" and (featureFlags.IS_AI_CHAT_SHARING_DROPDOWN_ENABLED or featureFlags.IS_RECORD_LEVEL_SHARING_ENABLED)))';

// Only an item still holding the expression and object scope it shipped with
// is moved, so a workspace that customized either keeps its version
export const buildShareRecordAvailabilityUpdate = ({
  flatCommandMenuItemsByUniversalIdentifier,
  flatObjectMetadataMaps,
  now,
  direction,
}: {
  flatCommandMenuItemsByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  now: string;
  direction: 'up' | 'down';
}): FlatCommandMenuItem[] => {
  const shareRecord =
    flatCommandMenuItemsByUniversalIdentifier[
      SHARE_RECORD_UNIVERSAL_IDENTIFIER
    ];

  if (!isDefined(shareRecord)) {
    return [];
  }

  const agentChatThreadUniversalIdentifier =
    STANDARD_OBJECTS.agentChatThread.universalIdentifier;

  if (direction === 'up') {
    return shareRecord.conditionalAvailabilityExpression ===
      CHAT_ONLY_SHARE_RECORD_EXPRESSION &&
      shareRecord.availabilityObjectMetadataUniversalIdentifier ===
        agentChatThreadUniversalIdentifier
      ? [
          {
            ...shareRecord,
            conditionalAvailabilityExpression:
              ALL_OBJECTS_SHARE_RECORD_EXPRESSION,
            availabilityObjectMetadataId: null,
            availabilityObjectMetadataUniversalIdentifier: null,
            updatedAt: now,
          },
        ]
      : [];
  }

  const agentChatThread =
    flatObjectMetadataMaps.byUniversalIdentifier[
      agentChatThreadUniversalIdentifier
    ];

  if (
    !isDefined(agentChatThread) ||
    shareRecord.conditionalAvailabilityExpression !==
      ALL_OBJECTS_SHARE_RECORD_EXPRESSION ||
    isDefined(shareRecord.availabilityObjectMetadataUniversalIdentifier)
  ) {
    return [];
  }

  return [
    {
      ...shareRecord,
      conditionalAvailabilityExpression: CHAT_ONLY_SHARE_RECORD_EXPRESSION,
      availabilityObjectMetadataId: agentChatThread.id,
      availabilityObjectMetadataUniversalIdentifier:
        agentChatThread.universalIdentifier,
      updatedAt: now,
    },
  ];
};
