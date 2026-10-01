import { msg } from '@lingui/core/macro';
import { type MessageDescriptor } from '@lingui/core';

import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';

export const AGENT_CHAT_THREAD_FILTER_STATUS_LABELS: Record<
  AgentChatThreadFilterStatus,
  MessageDescriptor
> = {
  active: msg`Open`,
  unread: msg`Unread`,
  snoozed: msg`Snoozed`,
  archived: msg`Done`,
  deleted: msg`Deleted`,
  all: msg`All`,
};
