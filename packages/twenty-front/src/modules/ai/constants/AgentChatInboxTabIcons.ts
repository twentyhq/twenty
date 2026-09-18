import {
  IconAt,
  IconInbox,
  IconMessage,
  IconUser,
  type IconComponent,
} from 'twenty-ui/icon';

import { AGENT_CHAT_INBOX_TAB } from '@/ai/constants/AgentChatInboxTab';
import { type AgentChatInboxTab } from '@/ai/types/AgentChatInboxTab';

export const AGENT_CHAT_INBOX_TAB_ICONS: Record<
  AgentChatInboxTab,
  IconComponent
> = {
  [AGENT_CHAT_INBOX_TAB.ALL]: IconInbox,
  [AGENT_CHAT_INBOX_TAB.ASSIGNED]: IconUser,
  [AGENT_CHAT_INBOX_TAB.SUBSCRIBED]: IconAt,
  [AGENT_CHAT_INBOX_TAB.DIRECT_MESSAGES]: IconMessage,
};
