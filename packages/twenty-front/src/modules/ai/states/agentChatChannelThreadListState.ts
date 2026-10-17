import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type AgentChatChannelThreadList = {
  viewKey: string;
  threadIds: string[];
  hasNextPage: boolean;
  endCursor: string | null;
  // Kept apart from the chats so it holds when the last one is filed away
  lastLoadedActivityAt: string | null;
};

export const agentChatChannelThreadListState =
  createAtomState<AgentChatChannelThreadList | null>({
    key: 'agentChatChannelThreadListState',
    defaultValue: null,
  });
