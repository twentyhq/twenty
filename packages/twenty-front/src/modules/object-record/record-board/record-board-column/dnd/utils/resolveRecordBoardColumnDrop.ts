type ResolveRecordBoardHeaderDropArgs = {
  pointerX: number;
  sourceIndex: number;
  scrollWrapperElement: HTMLElement;
  columnWidths: number[];
};

type ResolvedRecordBoardHeaderDrop = {
  sourceIndex: number;
  dropTargetIndex: number;
  destinationIndex: number;
};

const getDestinationIndexFromDropTargetIndex = ({
  sourceIndex,
  dropTargetIndex,
}: {
  sourceIndex: number;
  dropTargetIndex: number;
}) => (dropTargetIndex > sourceIndex ? dropTargetIndex - 1 : dropTargetIndex);

export const resolveRecordBoardColumnDrop = ({
  pointerX,
  sourceIndex,
  scrollWrapperElement,
  columnWidths,
}: ResolveRecordBoardHeaderDropArgs): ResolvedRecordBoardHeaderDrop => {
  const scrollContainerRect = scrollWrapperElement.getBoundingClientRect();

  const contentX =
    pointerX - scrollContainerRect.left + scrollWrapperElement.scrollLeft;

  let left = 0;

  for (const [index, columnWidth] of columnWidths.entries()) {
    const midpoint = left + columnWidth / 2;

    if (contentX < midpoint) {
      return {
        sourceIndex,
        dropTargetIndex: index,
        destinationIndex: getDestinationIndexFromDropTargetIndex({
          sourceIndex,
          dropTargetIndex: index,
        }),
      };
    }

    left += columnWidth;
  }

  const dropTargetIndex = columnWidths.length;

  return {
    sourceIndex,
    dropTargetIndex,
    destinationIndex: getDestinationIndexFromDropTargetIndex({
      sourceIndex,
      dropTargetIndex,
    }),
  };
};
