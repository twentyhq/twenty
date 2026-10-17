import { msg } from '@lingui/core/macro';
import { type MessageDescriptor } from '@lingui/core';

import { type AgentChatThreadFilterStatus } from 'twenty-shared/ai';

export const AGENT_CHAT_THREAD_FILTER_STATUS_LABELS: Record<
  AgentChatThreadFilterStatus,
  MessageDescriptor
> = {
  active: msg`Open`,
  needsInput: msg`Needs input`,
  mentions: msg`Mentions`,
  assigned: msg`Assigned`,
  snoozed: msg`Snoozed`,
  done: msg`Done`,
};
