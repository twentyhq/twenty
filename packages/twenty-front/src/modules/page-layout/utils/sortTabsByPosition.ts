export const sortTabsByPosition = <T extends { position: number }>(
  tabs: T[],
): T[] => {
  return tabs.toSorted((a, b) => a.position - b.position);
};
