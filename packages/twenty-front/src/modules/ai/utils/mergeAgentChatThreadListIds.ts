export const mergeAgentChatThreadListIds = ({
  mode,
  threadIdsBeforeRequest,
  currentThreadIds,
  pageThreadIds,
}: {
  mode: 'refresh' | 'fetch-more';
  threadIdsBeforeRequest: string[];
  currentThreadIds: string[];
  pageThreadIds: string[];
}): string[] => {
  const keptThreadIds =
    mode === 'fetch-more'
      ? currentThreadIds
      : currentThreadIds.filter(
          (threadId) => !threadIdsBeforeRequest.includes(threadId),
        );

  return [
    ...keptThreadIds,
    ...pageThreadIds.filter((threadId) => !keptThreadIds.includes(threadId)),
  ];
};
