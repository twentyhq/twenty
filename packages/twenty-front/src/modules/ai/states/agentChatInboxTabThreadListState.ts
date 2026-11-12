import { type AgentChatThreadFilterStatus } from 'twenty-shared/ai';

import { type AgentChatThreadPagedList } from '@/ai/types/AgentChatThreadPagedList';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type AgentChatInboxTabThreadList = AgentChatThreadPagedList & {
  filterStatus: AgentChatThreadFilterStatus;
};

export const agentChatInboxTabThreadListState =
  createAtomState<AgentChatInboxTabThreadList | null>({
    key: 'agentChatInboxTabThreadListState',
    defaultValue: null,
  });
