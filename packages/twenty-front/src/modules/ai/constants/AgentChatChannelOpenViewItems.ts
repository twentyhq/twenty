import { AGENT_CHAT_THREAD_PRESET_FILTER } from 'twenty-shared/ai';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
} from '~/generated-metadata/graphql';

export const AGENT_CHAT_CHANNEL_OPEN_VIEW_ITEMS = [
  {
    presetFilter: AGENT_CHAT_THREAD_PRESET_FILTER.OPEN,
    assignment: AgentChatChannelAssignmentFilter.ANY,
    filter: AgentChatChannelThreadFilter.ANY,
    countKey: 'openCount',
  },
  {
    presetFilter: AGENT_CHAT_THREAD_PRESET_FILTER.NEEDS_INPUT,
    assignment: AgentChatChannelAssignmentFilter.ANY,
    filter: AgentChatChannelThreadFilter.NEEDS_INPUT,
    countKey: 'needsInputCount',
  },
  {
    presetFilter: AGENT_CHAT_THREAD_PRESET_FILTER.MENTIONS,
    assignment: AgentChatChannelAssignmentFilter.ANY,
    filter: AgentChatChannelThreadFilter.MENTIONED,
    countKey: 'mentionedCount',
  },
  {
    presetFilter: AGENT_CHAT_THREAD_PRESET_FILTER.ASSIGNED_TO_ME,
    assignment: AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME,
    filter: AgentChatChannelThreadFilter.ANY,
    countKey: 'assignedToMeCount',
  },
  {
    presetFilter: AGENT_CHAT_THREAD_PRESET_FILTER.ASSIGNED_TO_ANYONE,
    assignment: AgentChatChannelAssignmentFilter.ASSIGNED,
    filter: AgentChatChannelThreadFilter.ANY,
    countKey: 'assignedCount',
  },
  {
    presetFilter: AGENT_CHAT_THREAD_PRESET_FILTER.UNASSIGNED,
    assignment: AgentChatChannelAssignmentFilter.UNASSIGNED,
    filter: AgentChatChannelThreadFilter.ANY,
    countKey: 'unassignedCount',
  },
] as const;
