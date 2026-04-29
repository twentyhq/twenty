import { msg } from '@lingui/core/macro';
import { type MessageDescriptor } from '@lingui/core';

import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';

export const AGENT_CHAT_THREAD_FILTER_STATUS_LABELS: Record<
  AgentChatThreadFilterStatus,
  MessageDescriptor
> = {
  active: msg`Active`,
  archived: msg`Archived`,
  all: msg`All`,
};
