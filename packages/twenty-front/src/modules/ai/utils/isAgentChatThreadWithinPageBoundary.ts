export const isAgentChatThreadWithinPageBoundary = ({
  threadId,
  sortAt,
  boundaryThreadId,
  boundarySortAt,
  isAscending,
}: {
  threadId: string;
  sortAt: string;
  boundaryThreadId: string;
  boundarySortAt: string;
  isAscending: boolean;
}): boolean => {
  const sortTime = new Date(sortAt).getTime();
  const boundarySortTime = new Date(boundarySortAt).getTime();

  if (sortTime === boundarySortTime) {
    return threadId >= boundaryThreadId;
  }

  return isAscending
    ? sortTime < boundarySortTime
    : sortTime > boundarySortTime;
};
