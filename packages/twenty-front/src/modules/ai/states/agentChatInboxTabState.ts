import { AGENT_CHAT_INBOX_TAB } from '@/ai/constants/AgentChatInboxTab';
import { type AgentChatInboxTab } from '@/ai/types/AgentChatInboxTab';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatInboxTabState = createAtomState<AgentChatInboxTab>({
  key: 'agentChatInboxTabState',
  defaultValue: AGENT_CHAT_INBOX_TAB.ALL,
});
