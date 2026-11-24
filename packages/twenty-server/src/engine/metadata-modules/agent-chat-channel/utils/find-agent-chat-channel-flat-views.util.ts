import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ViewFilterOperand } from 'twenty-shared/types';
import { arrayOfUuidOrVariableSchema, isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

const CHANNEL_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThread.fields.channelId.universalIdentifier;

export const findAgentChatChannelFlatViews = ({
  channelId,
  flatViewMaps,
  flatViewFilterMaps,
}: {
  channelId: string;
} & Pick<
  AllFlatEntityMaps,
  'flatViewMaps' | 'flatViewFilterMaps'
>): FlatView[] => {
  const viewUniversalIdentifiers = Object.values(
    flatViewFilterMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter((viewFilter) => {
      if (
        viewFilter.fieldMetadataUniversalIdentifier !==
          CHANNEL_FIELD_UNIVERSAL_IDENTIFIER ||
        viewFilter.operand !== ViewFilterOperand.IS ||
        isDefined(viewFilter.viewFilterGroupId)
      ) {
        return false;
      }

      const filteredChannelIds = arrayOfUuidOrVariableSchema.parse(
        viewFilter.value,
      );

      return (
        filteredChannelIds.length === 1 && filteredChannelIds[0] === channelId
      );
    })
    .map((viewFilter) => viewFilter.viewUniversalIdentifier);

  return findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
    flatEntityMaps: flatViewMaps,
    universalIdentifiers: [...new Set(viewUniversalIdentifiers)],
  });
};
