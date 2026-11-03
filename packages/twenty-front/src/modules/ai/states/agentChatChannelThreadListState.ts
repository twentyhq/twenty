import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type AgentChatChannelThreadList } from '@/ai/types/AgentChatChannelThreadList';

export const agentChatChannelThreadListState =
  createAtomState<AgentChatChannelThreadList | null>({
    key: 'agentChatChannelThreadListState',
    defaultValue: null,
  });
