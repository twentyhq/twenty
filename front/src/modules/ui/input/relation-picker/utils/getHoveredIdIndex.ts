export const getHoveredIdIndex = (
  hoveredIds: string[],
  currentlyHoveredId: string,
) => {
  const currentlyHoveredIdIndex = hoveredIds.findIndex(
    (val) => val === currentlyHoveredId,
  );

  return currentlyHoveredIdIndex === -1 ? 0 : currentlyHoveredIdIndex;
};
