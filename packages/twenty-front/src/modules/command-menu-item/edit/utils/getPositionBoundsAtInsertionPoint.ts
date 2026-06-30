type PositionedItem = { id: string; position: number };

export const getPositionBoundsAtInsertionPoint = (
  anchorItemId: string,
  insertionSide: 'before' | 'after',
  sectionItems: PositionedItem[],
) => {
  const anchorIndex = sectionItems.findIndex(
    (item) => item.id === anchorItemId,
  );

  if (anchorIndex === -1) {
    return undefined;
  }

  const insertIndex =
    insertionSide === 'before' ? anchorIndex : anchorIndex + 1;

  return {
    previousPosition: sectionItems[insertIndex - 1]?.position,
    nextPosition: sectionItems[insertIndex]?.position,
  };
};
