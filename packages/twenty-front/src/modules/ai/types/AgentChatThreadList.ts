export type AgentChatThreadList = {
  threadIds: string[];
  hasNextPage: boolean;
  endCursor: string | null;
  lastLoadedSortAt?: string | null;
  lastLoadedThreadId?: string | null;
};
