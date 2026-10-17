import { type AgentChatThreadFilterStatus } from 'twenty-shared/ai';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type AgentChatThreadFilterStatusPage = {
  hasNextPage: boolean;
  endCursor: string | null;
  totalCount: number;
};

// Pages of a single inbox tab add its chats to the list. They live on the
// list, so a refresh that replaces it starts the tabs over as well
export type AgentChatThreadList = {
  threadIds: string[];
  hasNextPage: boolean;
  endCursor: string | null;
  filterStatusPages?: Partial<
    Record<AgentChatThreadFilterStatus, AgentChatThreadFilterStatusPage>
  >;
};

export const agentChatThreadListState =
  createAtomState<AgentChatThreadList | null>({
    key: 'agentChatThreadListState',
    defaultValue: null,
  });
