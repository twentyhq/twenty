import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  ViewFilterOperand,
  type ViewPresetFilter,
  ViewType,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { AGENT_CHAT_CHANNEL_VIEW_DEFINITIONS } from 'src/engine/metadata-modules/agent-chat-channel/constants/agent-chat-channel-view-definitions.constant';
import { type AgentChatChannelViewsToCreate } from 'src/engine/metadata-modules/agent-chat-channel/types/agent-chat-channel-views-to-create.type';
import { buildBaseUniversalFlatView } from 'src/engine/metadata-modules/view/utils/build-base-universal-flat-view.util';

export const buildAgentChatChannelViewsToCreate = ({
  channelId,
  existingPresetFilters = [],
  applicationUniversalIdentifier,
}: {
  channelId: string;
  existingPresetFilters?: (ViewPresetFilter | null)[];
  applicationUniversalIdentifier: string;
}): AgentChatChannelViewsToCreate => {
  const viewsToCreate: AgentChatChannelViewsToCreate['viewsToCreate'] = [];
  const viewFiltersToCreate: AgentChatChannelViewsToCreate['viewFiltersToCreate'] =
    [];

  for (const [
    position,
    definition,
  ] of AGENT_CHAT_CHANNEL_VIEW_DEFINITIONS.entries()) {
    if (existingPresetFilters.includes(definition.presetFilter)) {
      continue;
    }

    const view = {
      ...buildBaseUniversalFlatView({
        objectMetadataUniversalIdentifier:
          STANDARD_OBJECTS.agentChatThread.universalIdentifier,
        applicationUniversalIdentifier,
        universalIdentifier: v4(),
        name: definition.name,
        key: null,
        icon: definition.icon,
        type: ViewType.INBOX,
        position,
        isSystemSideEffect: false,
      }),
      presetFilter: definition.presetFilter,
    };

    viewsToCreate.push(view);

    viewFiltersToCreate.push({
      id: v4(),
      universalIdentifier: v4(),
      applicationUniversalIdentifier,
      viewUniversalIdentifier: view.universalIdentifier,
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECTS.agentChatThread.fields.channelId.universalIdentifier,
      operand: ViewFilterOperand.IS,
      value: JSON.stringify([channelId]),
      subFieldName: null,
      viewFilterGroupUniversalIdentifier: null,
      positionInViewFilterGroup: null,
      relationTargetFieldMetadataUniversalIdentifier: null,
      createdAt: view.createdAt,
      updatedAt: view.createdAt,
      deletedAt: null,
    });
  }

  return { viewsToCreate, viewFiltersToCreate };
};
