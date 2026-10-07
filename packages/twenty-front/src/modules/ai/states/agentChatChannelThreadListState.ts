import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type AgentChatChannelThreadList = {
  viewKey: string;
  threadIds: string[];
  hasNextPage: boolean;
  endCursor: string | null;
};

// The pages of the channel view loaded from the server. The view itself is
// derived from the loaded chats, so it follows changes as they land
export const agentChatChannelThreadListState =
  createAtomState<AgentChatChannelThreadList | null>({
    key: 'agentChatChannelThreadListState',
    defaultValue: null,
  });
