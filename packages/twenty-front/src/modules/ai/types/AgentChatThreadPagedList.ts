export type AgentChatThreadPagedList = {
  threadIds: string[];
  hasNextPage: boolean;
  endCursor: string | null;
  lastLoadedActivityAt: string | null;
};
