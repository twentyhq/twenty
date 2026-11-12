export type AgentChatThreadList = {
  threadIds: string[];
  hasNextPage: boolean;
  endCursor: string | null;
  lastLoadedActivityAt: string | null;
};
