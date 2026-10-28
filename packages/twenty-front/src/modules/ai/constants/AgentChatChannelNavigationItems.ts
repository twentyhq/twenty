import { msg } from '@lingui/core/macro';
import {
  IconCircleCheck,
  IconCircleDashed,
  IconUsers,
  IconZzz,
} from 'twenty-ui/icon';

import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

export const AGENT_CHAT_CHANNEL_NAVIGATION_ITEMS = [
  {
    channelStatus: AgentChatChannelThreadStatus.OPEN,
    assignment: AgentChatChannelAssignmentFilter.ANY,
    label: msg`Open`,
    Icon: IconCircleDashed,
    countKey: 'openCount',
    unreadKey: 'hasUnreadOpen',
  },
  {
    channelStatus: AgentChatChannelThreadStatus.OPEN,
    assignment: AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME,
    label: msg`Assigned`,
    Icon: IconUsers,
    countKey: 'assignedToMeCount',
    unreadKey: 'hasUnreadAssignedToMe',
  },
  {
    channelStatus: AgentChatChannelThreadStatus.SNOOZED,
    assignment: AgentChatChannelAssignmentFilter.ANY,
    label: msg`Snoozed`,
    Icon: IconZzz,
    countKey: 'snoozedCount',
    unreadKey: undefined,
  },
  {
    channelStatus: AgentChatChannelThreadStatus.DONE,
    assignment: AgentChatChannelAssignmentFilter.ANY,
    label: msg`Done`,
    Icon: IconCircleCheck,
    countKey: 'doneCount',
    unreadKey: undefined,
  },
] as const;
