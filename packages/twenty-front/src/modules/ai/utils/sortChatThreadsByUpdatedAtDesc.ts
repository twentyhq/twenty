type ThreadWithUpdatedAt = { updatedAt: string | Date };

export const sortChatThreadsByUpdatedAtDesc = <T extends ThreadWithUpdatedAt>(
  threads: T[],
): T[] =>
  threads.toSorted(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
