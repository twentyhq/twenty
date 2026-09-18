import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { AGENT_CHAT_INBOX_TAB } from '@/ai/constants/AgentChatInboxTab';
import { type AgentChatInboxTab } from '@/ai/types/AgentChatInboxTab';

export const AGENT_CHAT_INBOX_TAB_LABELS: Record<
  AgentChatInboxTab,
  MessageDescriptor
> = {
  [AGENT_CHAT_INBOX_TAB.ALL]: msg`All`,
  [AGENT_CHAT_INBOX_TAB.ASSIGNED]: msg`Assigned`,
  [AGENT_CHAT_INBOX_TAB.SUBSCRIBED]: msg`Subscribed`,
  [AGENT_CHAT_INBOX_TAB.DIRECT_MESSAGES]: msg`Direct messages`,
};
