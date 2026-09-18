import { msg } from '@lingui/core/macro';
import { type MessageDescriptor } from '@lingui/core';
import { IconCheck, IconClockHour8, IconInbox } from 'twenty-ui/icon';
import { type IconComponent } from 'twenty-ui/icon';

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

export const AGENT_CHAT_THREAD_INBOX_STATE_ICONS: Record<
  AgentChatThreadInboxState,
  IconComponent
> = {
  [AGENT_CHAT_THREAD_INBOX_STATE.OPEN]: IconInbox,
  [AGENT_CHAT_THREAD_INBOX_STATE.SNOOZED]: IconClockHour8,
  [AGENT_CHAT_THREAD_INBOX_STATE.DONE]: IconCheck,
};

export const AGENT_CHAT_THREAD_INBOX_STATE_ORDER: AgentChatThreadInboxState[] = [
  AGENT_CHAT_THREAD_INBOX_STATE.OPEN,
  AGENT_CHAT_THREAD_INBOX_STATE.SNOOZED,
  AGENT_CHAT_THREAD_INBOX_STATE.DONE,
];
