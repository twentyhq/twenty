import { msg } from '@lingui/core/macro';
import { type MessageDescriptor } from '@lingui/core';

import { AGENT_CHAT_THREAD_INBOX_STATE } from '@/ai/constants/AgentChatThreadInboxState';
import { type AgentChatThreadInboxState } from '@/ai/types/AgentChatThreadInboxState';

export const AGENT_CHAT_THREAD_INBOX_STATE_LABELS: Record<
  AgentChatThreadInboxState,
  MessageDescriptor
> = {
  [AGENT_CHAT_THREAD_INBOX_STATE.OPEN]: msg`Open`,
  [AGENT_CHAT_THREAD_INBOX_STATE.SNOOZED]: msg`Snoozed`,
  [AGENT_CHAT_THREAD_INBOX_STATE.DONE]: msg`Done`,
};
