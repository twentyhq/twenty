export type InboxLoadedThreadList = {
  threadIds: string[];
  hasNextPage: boolean;
  endCursor: string | null;
  lastLoadedActivityAt: string | null;
};
