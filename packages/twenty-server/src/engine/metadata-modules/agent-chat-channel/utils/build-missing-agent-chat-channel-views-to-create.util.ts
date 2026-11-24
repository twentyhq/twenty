import { type AgentChatChannelViewsToCreate } from 'src/engine/metadata-modules/agent-chat-channel/types/agent-chat-channel-views-to-create.type';
import { buildAgentChatChannelViewsToCreate } from 'src/engine/metadata-modules/agent-chat-channel/utils/build-agent-chat-channel-views-to-create.util';
import { findAgentChatChannelFlatViews } from 'src/engine/metadata-modules/agent-chat-channel/utils/find-agent-chat-channel-flat-views.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export const buildMissingAgentChatChannelViewsToCreate = ({
  channelIds,
  flatViewMaps,
  flatViewFilterMaps,
  applicationUniversalIdentifier,
  now,
}: {
  channelIds: string[];
  applicationUniversalIdentifier: string;
  now: string;
} & Pick<
  AllFlatEntityMaps,
  'flatViewMaps' | 'flatViewFilterMaps'
>): AgentChatChannelViewsToCreate => {
  const channelViewsToCreate = channelIds.map((channelId) =>
    buildAgentChatChannelViewsToCreate({
      channelId,
      existingPresetFilters: findAgentChatChannelFlatViews({
        channelId,
        flatViewMaps,
        flatViewFilterMaps,
      }).map(({ presetFilter }) => presetFilter),
      applicationUniversalIdentifier,
      now,
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
