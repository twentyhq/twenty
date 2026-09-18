import { AGENT_CHAT_THREAD_INBOX_STATE } from '@/ai/constants/AgentChatThreadInboxState';
import { type AgentChatThreadInboxState } from '@/ai/types/AgentChatThreadInboxState';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatInboxStateTabState =
  createAtomState<AgentChatThreadInboxState>({
    key: 'agentChatInboxStateTabState',
    defaultValue: AGENT_CHAT_THREAD_INBOX_STATE.OPEN,
  });

export const agentChatChannelInboxStateTabState =
  createAtomState<AgentChatThreadInboxState>({
    key: 'agentChatChannelInboxStateTabState',
    defaultValue: AGENT_CHAT_THREAD_INBOX_STATE.OPEN,
  });
