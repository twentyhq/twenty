import { msg } from '@lingui/core/macro';
import { IconCircleCheck, IconCircleDashed, IconZzz } from 'twenty-ui/icon';

import { AgentChatChannelThreadStatus } from '~/generated-metadata/graphql';

export const AGENT_CHAT_CHANNEL_NAVIGATION_ITEMS = [
  {
    channelStatus: AgentChatChannelThreadStatus.OPEN,
    label: msg`Open`,
    Icon: IconCircleDashed,
    countKey: 'openCount',
    unreadKey: 'hasUnreadOpen',
  },
  {
    channelStatus: AgentChatChannelThreadStatus.SNOOZED,
    label: msg`Snoozed`,
    Icon: IconZzz,
    countKey: 'snoozedCount',
    unreadKey: undefined,
  },
  {
    channelStatus: AgentChatChannelThreadStatus.DONE,
    label: msg`Done`,
    Icon: IconCircleCheck,
    countKey: 'doneCount',
    unreadKey: undefined,
  },
] as const;
