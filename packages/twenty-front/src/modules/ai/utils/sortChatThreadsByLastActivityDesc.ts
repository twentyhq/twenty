type ThreadWithLastActivity = {
  updatedAt: string | Date;
};

// Sending a message touches its conversation's updatedAt.
const getLastActivityMs = (thread: ThreadWithLastActivity): number =>
  new Date(thread.updatedAt).getTime();

export const sortChatThreadsByLastActivityDesc = <
  T extends ThreadWithLastActivity,
>(
  threads: T[],
): T[] =>
  threads.toSorted((a, b) => getLastActivityMs(b) - getLastActivityMs(a));
