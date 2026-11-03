import { type AgentChatThreadList } from '@/ai/types/AgentChatThreadList';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatSnoozedThreadListState =
  createAtomState<AgentChatThreadList | null>({
    key: 'agentChatSnoozedThreadListState',
    defaultValue: null,
  });
