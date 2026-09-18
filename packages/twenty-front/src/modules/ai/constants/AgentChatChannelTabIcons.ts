import {
  IconCheck,
  IconClockHour8,
  IconInbox,
  IconUser,
  type IconComponent,
} from 'twenty-ui/icon';

import { AGENT_CHAT_CHANNEL_TAB } from '@/ai/constants/AgentChatChannelTab';
import { type AgentChatChannelTab } from '@/ai/types/AgentChatChannelTab';

export const AGENT_CHAT_CHANNEL_TAB_ICONS: Record<
  AgentChatChannelTab,
  IconComponent
> = {
  [AGENT_CHAT_CHANNEL_TAB.UNASSIGNED]: IconInbox,
  [AGENT_CHAT_CHANNEL_TAB.ASSIGNED]: IconUser,
  [AGENT_CHAT_CHANNEL_TAB.SNOOZED]: IconClockHour8,
  [AGENT_CHAT_CHANNEL_TAB.DONE]: IconCheck,
};
