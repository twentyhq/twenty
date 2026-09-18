import { AGENT_CHAT_CHANNEL_TAB } from '@/ai/constants/AgentChatChannelTab';
import { AGENT_CHAT_THREAD_INBOX_STATE } from '@/ai/constants/AgentChatThreadInboxState';
import { type AgentChatChannelTab } from '@/ai/types/AgentChatChannelTab';
import { type AgentChatThreadInboxState } from '@/ai/types/AgentChatThreadInboxState';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatInboxStateTabState =
  createAtomState<AgentChatThreadInboxState>({
    key: 'agentChatInboxStateTabState',
    defaultValue: AGENT_CHAT_THREAD_INBOX_STATE.OPEN,
  });

// A channel opens on what nobody has taken yet: that is the list a team works
// down, where the assigned one is somebody else's business.
export const agentChatChannelTabState = createAtomState<AgentChatChannelTab>({
  key: 'agentChatChannelTabState',
  defaultValue: AGENT_CHAT_CHANNEL_TAB.UNASSIGNED,
});
