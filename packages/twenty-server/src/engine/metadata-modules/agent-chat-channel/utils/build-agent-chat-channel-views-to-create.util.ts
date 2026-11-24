import { DEFAULT_VIEW_GROUP_LOAD_LIMIT } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  ViewFilterOperand,
  ViewOpenRecordIn,
  type ViewPresetFilter,
  ViewType,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { AGENT_CHAT_CHANNEL_VIEW_DEFINITIONS } from 'src/engine/metadata-modules/agent-chat-channel/constants/agent-chat-channel-view-definitions.constant';
import { type AgentChatChannelViewsToCreate } from 'src/engine/metadata-modules/agent-chat-channel/types/agent-chat-channel-views-to-create.type';

export const buildAgentChatChannelViewsToCreate = ({
  channelId,
  existingPresetFilters = [],
  applicationUniversalIdentifier,
  now,
}: {
  channelId: string;
  existingPresetFilters?: (ViewPresetFilter | null)[];
  applicationUniversalIdentifier: string;
  now: string;
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

    const viewUniversalIdentifier = v4();

    viewsToCreate.push({
      id: v4(),
      universalIdentifier: viewUniversalIdentifier,
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier:
        STANDARD_OBJECTS.agentChatThread.universalIdentifier,
      name: definition.name,
      icon: definition.icon,
      type: ViewType.INBOX,
      key: null,
      position,
      presetFilter: definition.presetFilter,
      isCompact: false,
      openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
      kanbanAggregateOperation: null,
      kanbanAggregateOperationFieldMetadataUniversalIdentifier: null,
      mainGroupByFieldMetadataUniversalIdentifier: null,
      shouldHideEmptyGroups: false,
      shouldDisplayGroupsAsTabs: false,
      kanbanColumnWidth: null,
      groupLoadLimit: DEFAULT_VIEW_GROUP_LOAD_LIMIT,
      calendarLayout: null,
      calendarFieldMetadataUniversalIdentifier: null,
      calendarEndFieldMetadataUniversalIdentifier: null,
      anyFieldFilterValue: null,
      isPrivate: false,
      createdByUserWorkspaceId: null,
      isActive: true,
      isSystemSideEffect: false,
      universalOverrides: null,
      viewFieldUniversalIdentifiers: [],
      viewFieldGroupUniversalIdentifiers: [],
      viewFilterUniversalIdentifiers: [],
      viewGroupUniversalIdentifiers: [],
      viewFilterGroupUniversalIdentifiers: [],
      viewSortUniversalIdentifiers: [],
      navigationMenuItemUniversalIdentifiers: [],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });

    viewFiltersToCreate.push({
      id: v4(),
      universalIdentifier: v4(),
      applicationUniversalIdentifier,
      viewUniversalIdentifier,
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECTS.agentChatThread.fields.channelId.universalIdentifier,
      operand: ViewFilterOperand.IS,
      value: JSON.stringify([channelId]),
      subFieldName: null,
      viewFilterGroupUniversalIdentifier: null,
      positionInViewFilterGroup: null,
      relationTargetFieldMetadataUniversalIdentifier: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  return { viewsToCreate, viewFiltersToCreate };
};
