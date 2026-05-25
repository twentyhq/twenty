import { msg } from '@lingui/core/macro';
import { type MessageDescriptor } from '@lingui/core';

import { type AgentChatThreadGroupBy } from '@/ai/types/AgentChatThreadGroupBy';

export const AGENT_CHAT_THREAD_GROUP_BY_LABELS: Record<
  AgentChatThreadGroupBy,
  MessageDescriptor
> = {
  date: msg`Date`,
  none: msg`None`,
};
