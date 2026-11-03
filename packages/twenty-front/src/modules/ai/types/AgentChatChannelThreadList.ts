export type AgentChatChannelThreadList = {
  viewKey: string;
  threadIds: string[];
  hasNextPage: boolean;
  endCursor: string | null;
  lastLoadedSortAt: string | null;
  lastLoadedThreadId: string | null;
};
