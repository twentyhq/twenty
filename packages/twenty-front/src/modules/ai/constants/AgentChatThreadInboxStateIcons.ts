import { IconCheck, IconClockHour8, IconInbox } from 'twenty-ui/icon';
import { type IconComponent } from 'twenty-ui/icon';

import { AGENT_CHAT_THREAD_INBOX_STATE } from '@/ai/constants/AgentChatThreadInboxState';
import { type AgentChatThreadInboxState } from '@/ai/types/AgentChatThreadInboxState';

export const AGENT_CHAT_THREAD_INBOX_STATE_ICONS: Record<
  AgentChatThreadInboxState,
  IconComponent
> = {
  [AGENT_CHAT_THREAD_INBOX_STATE.OPEN]: IconInbox,
  [AGENT_CHAT_THREAD_INBOX_STATE.SNOOZED]: IconClockHour8,
  [AGENT_CHAT_THREAD_INBOX_STATE.DONE]: IconCheck,
};
