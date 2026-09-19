import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { AGENT_CHAT_CHANNEL_TAB } from '@/ai/constants/AgentChatChannelTab';
import { type AgentChatChannelTab } from '@/ai/types/AgentChatChannelTab';

export const AGENT_CHAT_CHANNEL_TAB_LABELS: Record<
  AgentChatChannelTab,
  MessageDescriptor
> = {
  [AGENT_CHAT_CHANNEL_TAB.UNASSIGNED]: msg`Unassigned`,
  [AGENT_CHAT_CHANNEL_TAB.ASSIGNED]: msg`Assigned`,
  [AGENT_CHAT_CHANNEL_TAB.SNOOZED]: msg`Snoozed`,
  [AGENT_CHAT_CHANNEL_TAB.DONE]: msg`Done`,
};
