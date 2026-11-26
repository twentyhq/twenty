import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ViewFilterOperand, type ViewPresetFilter } from 'twenty-shared/types';
import { arrayOfUuidOrVariableSchema, isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_CHANNEL_VIEW_DEFINITIONS } from 'src/engine/metadata-modules/agent-chat-channel/constants/agent-chat-channel-view-definitions.constant';
import { type AgentChatChannelViewCandidateMaps } from 'src/engine/metadata-modules/agent-chat-channel/types/agent-chat-channel-view-candidate-maps.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

const CHANNEL_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThread.fields.channelId.universalIdentifier;

const CHANNEL_VIEW_PRESET_FILTERS: (ViewPresetFilter | null)[] =
  AGENT_CHAT_CHANNEL_VIEW_DEFINITIONS.map(({ presetFilter }) => presetFilter);

export const findAgentChatChannelFlatViews = <
  TFlatView extends Pick<FlatView, 'presetFilter'>,
>({
  channelId,
  flatViewMaps,
  flatViewFilterMaps,
}: {
  channelId: string;
} & AgentChatChannelViewCandidateMaps<TFlatView>): TFlatView[] => {
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

  return [...new Set(viewUniversalIdentifiers)]
    .map(
      (viewUniversalIdentifier) =>
        flatViewMaps.byUniversalIdentifier[viewUniversalIdentifier],
    )
    .filter(isDefined)
    .filter(({ presetFilter }) =>
      CHANNEL_VIEW_PRESET_FILTERS.includes(presetFilter),
    );
};
