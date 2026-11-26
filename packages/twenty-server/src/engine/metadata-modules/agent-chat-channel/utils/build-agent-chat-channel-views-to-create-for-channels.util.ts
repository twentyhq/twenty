import { type AgentChatChannelViewCandidateMaps } from 'src/engine/metadata-modules/agent-chat-channel/types/agent-chat-channel-view-candidate-maps.type';
import { type AgentChatChannelViewsToCreate } from 'src/engine/metadata-modules/agent-chat-channel/types/agent-chat-channel-views-to-create.type';
import { buildAgentChatChannelViewsToCreate } from 'src/engine/metadata-modules/agent-chat-channel/utils/build-agent-chat-channel-views-to-create.util';
import { findAgentChatChannelFlatViews } from 'src/engine/metadata-modules/agent-chat-channel/utils/find-agent-chat-channel-flat-views.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

export const buildAgentChatChannelViewsToCreateForChannels = <
  TFlatView extends Pick<FlatView, 'presetFilter'>,
>({
  channelIds,
  flatViewMaps,
  flatViewFilterMaps,
  applicationUniversalIdentifier,
}: {
  channelIds: string[];
  applicationUniversalIdentifier: string;
} & AgentChatChannelViewCandidateMaps<TFlatView>): AgentChatChannelViewsToCreate => {
  const channelViewsToCreate = channelIds.map((channelId) =>
    buildAgentChatChannelViewsToCreate({
      channelId,
      existingPresetFilters: findAgentChatChannelFlatViews({
        channelId,
        flatViewMaps,
        flatViewFilterMaps,
      }).map(({ presetFilter }) => presetFilter),
      applicationUniversalIdentifier,
    }),
  );

  return {
    viewsToCreate: channelViewsToCreate.flatMap(
      ({ viewsToCreate }) => viewsToCreate,
    ),
    viewFiltersToCreate: channelViewsToCreate.flatMap(
      ({ viewFiltersToCreate }) => viewFiltersToCreate,
    ),
  };
};
