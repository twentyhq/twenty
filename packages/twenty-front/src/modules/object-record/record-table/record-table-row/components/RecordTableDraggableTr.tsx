import { useSortable } from '@dnd-kit/react/sortable';
import { type ReactNode, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { RECORD_TABLE_NO_RECORD_GROUP_DROPPABLE_ID } from '@/object-record/record-table/constants/RecordTableNoRecordGroupDroppableId';
import { RECORD_TABLE_ROW_DND_TYPE } from '@/object-record/record-table/constants/RecordTableRowDndType';
import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableRowMultiDragPreview } from '@/object-record/record-table/record-table-row/components/RecordTableRowMultiDragPreview';
import { RecordTableTr } from '@/object-record/record-table/record-table-row/components/RecordTableTr';
import { useIsTableRowSecondaryDragged } from '@/object-record/record-table/record-table-row/hooks/useIsRecordSecondaryDragged';
import { type RecordTableRowDragData } from '@/object-record/record-table/types/RecordTableRowDragData';
import { DragDropItemDropLine } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropLine';
import { DND_KIT_PLUGINS_WITHOUT_OPTIMISTIC } from '@/ui/utilities/drag-and-drop/constants/DndKitPluginsWithoutOptimistic';
import { DragDropItemSortableHandleRefContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemSortableHandleRefContext';

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
  const { theme } = useContext(ThemeContext);

  const { isSecondaryDragged } = useIsTableRowSecondaryDragged(recordId);

  const { recordGroupId } = useContext(RecordGroupContext);

  const droppableId = isDefined(recordGroupId)
    ? recordGroupId
    : RECORD_TABLE_NO_RECORD_GROUP_DROPPABLE_ID;

  const rowDragData: RecordTableRowDragData = {
    droppableId,
    index: draggableIndex,
    focusIndex,
  };

  const { handleRef, ref, isDragging, isDragSource, isDropTarget } =
    useSortable({
      id: recordId,
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
        background: isDragging ? theme.background.transparent.light : undefined,
        borderColor: isDragging
          ? `${theme.border.color.medium}`
          : 'transparent',
        opacity: isSecondaryDragged ? 0.3 : undefined,
      }}
      isDragging={isDragging}
      data-testid={`row-id-${recordId}`}
      data-selectable-id={recordId}
      onClick={onClick}
    >
      <DragDropItemSortableHandleRefContext.Provider value={handleRef}>
        <RecordTableRowDraggableContextProvider value={{ isDragging }}>
          {children}
          <RecordTableRowMultiDragPreview />
        </RecordTableRowDraggableContextProvider>
      </DragDropItemSortableHandleRefContext.Provider>
      {isDropTarget && !isDragSource && <DragDropItemDropLine />}
    </RecordTableTr>
  );
};
