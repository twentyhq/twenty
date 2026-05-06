type ThreadWithLastActivity = {
  lastMessageAt?: string | Date | null;
  updatedAt: string | Date;
};

const getLastActivityMs = (thread: ThreadWithLastActivity): number =>
  new Date(thread.lastMessageAt ?? thread.updatedAt).getTime();

export const sortChatThreadsByLastActivityDesc = <
  T extends ThreadWithLastActivity,
>(
  threads: T[],
): T[] =>
  threads.toSorted((a, b) => getLastActivityMs(b) - getLastActivityMs(a));
