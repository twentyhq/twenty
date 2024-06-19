export const getNumberOfCardsPerColumnForSkeletonLoading = (
  columnIndex: number,
): number => {
  const skeletonCounts: Record<number, number> = {
    0: 2,
    1: 1,
    2: 3,
    3: 0,
    4: 1,
  };

  return skeletonCounts[columnIndex] || 0;
};
