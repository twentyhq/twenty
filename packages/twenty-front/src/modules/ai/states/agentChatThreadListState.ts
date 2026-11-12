import { type AgentChatThreadFilterStatus } from 'twenty-shared/ai';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type AgentChatThreadFilterStatusPage = {
  threadIds: string[];
  hasNextPage: boolean;
  endCursor: string | null;
};

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
