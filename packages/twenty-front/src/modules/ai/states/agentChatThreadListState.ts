import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

import { type AgentChatThreadList } from '@/ai/types/AgentChatThreadList';

export const agentChatThreadListState =
  createAtomState<AgentChatThreadList | null>({
    key: 'agentChatThreadListState',
    defaultValue: null,
  });
