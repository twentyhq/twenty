import { useSortable } from '@dnd-kit/react/sortable';
import { styled } from '@linaria/react';
import { type ReactNode, useContext, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RECORD_TABLE_ROW_DND_TYPE } from '@/object-record/record-table/constants/RecordTableRowDndType';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableTr } from '@/object-record/record-table/record-table-row/components/RecordTableTr';
import { isRecordIdSecondaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdSecondaryDragMultipleComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { type RecordTableRowDragData } from '@/object-record/record-table/types/RecordTableRowDragData';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { DND_KIT_PLUGINS_WITHOUT_OPTIMISTIC } from '@/ui/utilities/drag-and-drop/constants/DndKitPluginsWithoutOptimistic';
import { DRAG_SOURCE_OPACITY } from '@/ui/utilities/drag-and-drop/constants/DragSourceOpacity';
import { DragDropItemSortableHandleRefContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemSortableHandleRefContext';

// Above TABLE_Z_INDEX.cell.sticky so sticky cells don't paint over the insertion line.
const StyledRowDropTargetSlot = styled.div`
  left: 0;
  position: absolute;
  right: 0;
  top: -1px;
  z-index: ${TABLE_Z_INDEX.rowDropLine};
`;

type RecordTableDraggableTrProps = {
  className?: string;
  recordId: string;
  draggableIndex: number;
  focusIndex: number;
  isDragDisabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLTableRowElement>) => void;
  children: ReactNode;
};

export const RecordTableDraggableTr = ({
  className,
  recordId,
  draggableIndex,
  focusIndex,
  isDragDisabled,
  onClick,
  children,
}: RecordTableDraggableTrProps) => {
  const isRecordIdSecondaryDragMultiple = useAtomComponentFamilyStateValue(
    isRecordIdSecondaryDragMultipleComponentFamilyState,
    { recordId },
  );

  const { recordGroupId } = useContext(RecordGroupContext);

  const droppableId = isDefined(recordGroupId)
    ? recordGroupId
    : NO_RECORD_GROUP_FAMILY_KEY;

  const rowDragData: RecordTableRowDragData = {
    droppableId,
    index: draggableIndex,
    recordId,
    focusIndex,
  };

  // Stable per instance: dnd-kit breaks a row when virtualization shifts recordIds across mounted rows.
  const [sortableId] = useState(() => v4());

  const { handleRef, ref, isDragSource } = useSortable({
    id: sortableId,
    index: draggableIndex,
    group: droppableId,
    type: RECORD_TABLE_ROW_DND_TYPE,
    accept: RECORD_TABLE_ROW_DND_TYPE,
    data: rowDragData,
    disabled: isDragDisabled,
    transition: null,
    plugins: DND_KIT_PLUGINS_WITHOUT_OPTIMISTIC,
    feedback: 'clone',
  });

  return (
    <RecordTableTr
      recordId={recordId}
      focusIndex={focusIndex}
      ref={ref}
      className={className}
      style={{
        opacity:
          isDragSource || isRecordIdSecondaryDragMultiple
            ? DRAG_SOURCE_OPACITY
            : undefined,
      }}
      isDragging={false}
      data-testid={`row-id-${recordId}`}
      data-selectable-id={recordId}
      onClick={onClick}
    >
      <DragDropItemSortableHandleRefContext.Provider value={handleRef}>
        <RecordTableRowDraggableContextProvider value={{ isDragging: false }}>
          {children}
        </RecordTableRowDraggableContextProvider>
      </DragDropItemSortableHandleRefContext.Provider>
      {!isDragSource && (
        <StyledRowDropTargetSlot>
          <DragDropItemDropTarget
            index={draggableIndex}
            droppableId={droppableId}
            orientation="horizontal"
            compact
            seamAligned
          />
        </StyledRowDropTargetSlot>
      )}
    </RecordTableTr>
  );
};
