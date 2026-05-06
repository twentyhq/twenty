import { msg } from '@lingui/core/macro';
import { type MessageDescriptor } from '@lingui/core';

import { type AgentChatThreadLastActivityFilter } from '@/ai/types/AgentChatThreadLastActivityFilter';

export const AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_LABELS: Record<
  AgentChatThreadLastActivityFilter,
  MessageDescriptor
> = {
  all: msg`All`,
  '1d': msg`1d`,
  '3d': msg`3d`,
  '7d': msg`7d`,
  '30d': msg`30d`,
};
