import { type AgentChatThreadFilterStatus } from 'twenty-shared/ai';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// The tab's chats stay off threadIds, which the recent chat lists render in order
export type AgentChatThreadFilterStatusPage = {
  threadIds: string[];
  hasNextPage: boolean;
  endCursor: string | null;
};

// Tab pages live on the list, so a refresh that replaces it starts the tabs over
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
