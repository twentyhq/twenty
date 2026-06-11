import { type RecordField } from '@/object-record/record-field/types/RecordField';

type ResolveRecordTableHeaderDropArgs = {
  pointerX: number;
  sourceIndex: number;
  scrollWrapperElement: HTMLElement;
  nonSortableColumnsWidth: number;
  recordFields: RecordField[];
};

export type ResolvedRecordTableHeaderDrop = {
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

export const resolveRecordTableHeaderDrop = ({
  pointerX,
  sourceIndex,
  scrollWrapperElement,
  nonSortableColumnsWidth,
  recordFields,
}: ResolveRecordTableHeaderDropArgs): ResolvedRecordTableHeaderDrop => {
  const scrollContainerRect = scrollWrapperElement.getBoundingClientRect();

  const contentX =
    pointerX -
    scrollContainerRect.left +
    scrollWrapperElement.scrollLeft -
    nonSortableColumnsWidth;

  let left = 0;

  for (const [index, field] of recordFields.entries()) {
    const width = field.size;
    const midpoint = left + width / 2;

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

    left += width;
  }

  const dropTargetIndex = recordFields.length;

  return {
    sourceIndex,
    dropTargetIndex,
    destinationIndex: getDestinationIndexFromDropTargetIndex({
      sourceIndex,
      dropTargetIndex,
    }),
  };
};
