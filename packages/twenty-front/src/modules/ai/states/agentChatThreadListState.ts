import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type AgentChatThreadList = {
  threadIds: string[];
  hasNextPage: boolean;
  endCursor: string | null;
};

export const agentChatThreadListState =
  createAtomState<AgentChatThreadList | null>({
    key: 'agentChatThreadListState',
    defaultValue: null,
  });
