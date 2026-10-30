import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
} from '~/generated-metadata/graphql';

export const AGENT_CHAT_CHANNEL_OPEN_VIEW_ITEMS = [
  {
    filterStatus: AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE,
    assignment: AgentChatChannelAssignmentFilter.ANY,
    filter: AgentChatChannelThreadFilter.ANY,
    countKey: 'openCount',
  },
  {
    filterStatus: AGENT_CHAT_THREAD_FILTER_STATUS.NEEDS_INPUT,
    assignment: AgentChatChannelAssignmentFilter.ANY,
    filter: AgentChatChannelThreadFilter.NEEDS_INPUT,
    countKey: 'needsInputCount',
  },
  {
    filterStatus: AGENT_CHAT_THREAD_FILTER_STATUS.MENTIONS,
    assignment: AgentChatChannelAssignmentFilter.ANY,
    filter: AgentChatChannelThreadFilter.MENTIONED,
    countKey: 'mentionedCount',
  },
  {
    filterStatus: AGENT_CHAT_THREAD_FILTER_STATUS.ASSIGNED_TO_ME,
    assignment: AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME,
    filter: AgentChatChannelThreadFilter.ANY,
    countKey: 'assignedToMeCount',
  },
  {
    filterStatus: AGENT_CHAT_THREAD_FILTER_STATUS.ASSIGNED,
    assignment: AgentChatChannelAssignmentFilter.ASSIGNED,
    filter: AgentChatChannelThreadFilter.ANY,
    countKey: 'assignedCount',
  },
  {
    filterStatus: AGENT_CHAT_THREAD_FILTER_STATUS.UNASSIGNED,
    assignment: AgentChatChannelAssignmentFilter.UNASSIGNED,
    filter: AgentChatChannelThreadFilter.ANY,
    countKey: 'unassignedCount',
  },
] as const;
