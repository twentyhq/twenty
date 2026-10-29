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
    unreadKey: 'hasUnreadOpen',
  },
  {
    filterStatus: AGENT_CHAT_THREAD_FILTER_STATUS.NEEDS_INPUT,
    assignment: AgentChatChannelAssignmentFilter.ANY,
    filter: AgentChatChannelThreadFilter.NEEDS_INPUT,
    countKey: 'needsInputCount',
    unreadKey: undefined,
  },
  {
    filterStatus: AGENT_CHAT_THREAD_FILTER_STATUS.MENTIONS,
    assignment: AgentChatChannelAssignmentFilter.ANY,
    filter: AgentChatChannelThreadFilter.MENTIONED,
    countKey: undefined,
    unreadKey: undefined,
  },
  {
    filterStatus: AGENT_CHAT_THREAD_FILTER_STATUS.ASSIGNED,
    assignment: AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME,
    filter: AgentChatChannelThreadFilter.ANY,
    countKey: 'assignedToMeCount',
    unreadKey: 'hasUnreadAssignedToMe',
  },
] as const;
