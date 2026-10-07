import { msg } from '@lingui/core/macro';
import { type MessageDescriptor } from '@lingui/core';

import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';

export const AGENT_CHAT_THREAD_FILTER_STATUS_LABELS: Record<
  AgentChatThreadFilterStatus,
  MessageDescriptor
> = {
  active: msg`Open`,
  needsInput: msg`Needs input`,
  mentions: msg`Mentions`,
  snoozed: msg`Snoozed`,
  done: msg`Done`,
};
