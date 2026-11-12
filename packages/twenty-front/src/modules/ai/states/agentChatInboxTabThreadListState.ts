import { type AgentChatThreadFilterStatus } from 'twenty-shared/ai';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type AgentChatInboxTabThreadList = {
  filterStatus: AgentChatThreadFilterStatus;
  threadIds: string[];
  hasNextPage: boolean;
  endCursor: string | null;
  lastLoadedActivityAt: string | null;
};

export const agentChatInboxTabThreadListState =
  createAtomState<AgentChatInboxTabThreadList | null>({
    key: 'agentChatInboxTabThreadListState',
    defaultValue: null,
  });
