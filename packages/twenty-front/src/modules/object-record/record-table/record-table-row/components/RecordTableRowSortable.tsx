import { useSortable } from '@dnd-kit/react/sortable';
import { styled } from '@linaria/react';
import { type RefObject, useState } from 'react';
import { v4 } from 'uuid';

import { RECORD_TABLE_ROW_DND_TYPE } from '@/object-record/record-table/constants/RecordTableRowDndType';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { recordTableRowIndexOfRecordComponentFamilySelector } from '@/object-record/record-table/states/selectors/recordTableRowIndexOfRecordComponentFamilySelector';
import { type RecordDragData } from '@/object-record/record-drag/types/RecordDragData';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { DND_KIT_PLUGINS_WITHOUT_OPTIMISTIC } from '@/ui/utilities/drag-and-drop/constants/DndKitPluginsWithoutOptimistic';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';

// Above TABLE_Z_INDEX.cell.sticky so sticky cells don't paint over the insertion line.
const StyledRowDropTargetSlot = styled.div`
  left: 0;
  position: absolute;
  right: 0;
  top: -1px;
  z-index: ${TABLE_Z_INDEX.rowDropLine};
`;

type RecordTableRowSortableProps = {
  recordId: string;
  droppableId: string;
  draggableIndex?: number;
  isDragDisabled?: boolean;
  rowElementRef: RefObject<HTMLDivElement | null>;
  handleElementRef: RefObject<Element | null>;
};

export const RecordTableRowSortable = ({
  recordId,
  droppableId,
  draggableIndex,
  isDragDisabled,
  rowElementRef,
  handleElementRef,
}: RecordTableRowSortableProps) => {
  const rowIndex = useAtomComponentFamilySelectorValue(
    recordTableRowIndexOfRecordComponentFamilySelector,
    recordId,
  );

  const index = draggableIndex ?? rowIndex ?? 0;

  const rowDragData: RecordDragData = {
    droppableId,
    index,
    recordId,
  };

  // Stable per instance: dnd-kit breaks a row when its id changes while mounted.
  const [sortableId] = useState(() => v4());

  const { isDragSource } = useSortable({
    id: sortableId,
    index,
    group: droppableId,
    type: RECORD_TABLE_ROW_DND_TYPE,
    accept: RECORD_TABLE_ROW_DND_TYPE,
    data: rowDragData,
    disabled: isDragDisabled,
    transition: null,
    plugins: DND_KIT_PLUGINS_WITHOUT_OPTIMISTIC,
    feedback: 'clone',
    element: rowElementRef,
    handle: handleElementRef,
  });

  if (isDragSource) {
    return null;
  }

  return (
    <StyledRowDropTargetSlot>
      <DragDropItemDropTarget
        index={index}
        droppableId={droppableId}
        orientation="horizontal"
        compact
        seamAligned
      />
    </StyledRowDropTargetSlot>
  );
};
