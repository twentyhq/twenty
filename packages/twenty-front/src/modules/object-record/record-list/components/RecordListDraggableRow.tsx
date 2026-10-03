import { useSortable } from '@dnd-kit/react/sortable';
import { styled } from '@linaria/react';

import { useIsRecordSecondaryDragged } from '@/object-record/record-drag/hooks/useIsRecordSecondaryDragged';
import { type RecordDragData } from '@/object-record/record-drag/types/RecordDragData';
import { RecordListRow } from '@/object-record/record-list/components/RecordListRow';
import { useRecordListContextOrThrow } from '@/object-record/record-list/contexts/RecordListContext';
import { RECORD_LIST_ROW_DND_TYPE } from '@/object-record/record-list/constants/RecordListRowDndType';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { DND_KIT_PLUGINS_WITHOUT_OPTIMISTIC } from '@/ui/utilities/drag-and-drop/constants/DndKitPluginsWithoutOptimistic';
import { DRAG_SOURCE_OPACITY } from '@/ui/utilities/drag-and-drop/constants/DragSourceOpacity';
import { preventNativeDragStart } from '@/ui/utilities/drag-and-drop/utils/preventNativeDragStart';

const StyledDraggableRow = styled.div<{ $isDragSourceFaded: boolean }>`
  opacity: ${({ $isDragSourceFaded }) =>
    $isDragSourceFaded ? DRAG_SOURCE_OPACITY : 1};
  position: relative;
`;

const StyledRowDropTargetSlot = styled.div`
  left: 0;
  position: absolute;
  right: 0;
  top: -1px;
`;

type RecordListDraggableRowProps = {
  recordId: string;
  index: number;
  droppableId: string;
};

export const RecordListDraggableRow = ({
  recordId,
  index,
  droppableId,
}: RecordListDraggableRowProps) => {
  const { objectPermissions } = useRecordListContextOrThrow();
  const { isSecondaryDragged } = useIsRecordSecondaryDragged(recordId);

  const rowDragData: RecordDragData = {
    droppableId,
    index,
    recordId,
  };

  const { ref, isDragSource } = useSortable({
    id: recordId,
    index,
    group: droppableId,
    type: RECORD_LIST_ROW_DND_TYPE,
    accept: RECORD_LIST_ROW_DND_TYPE,
    data: rowDragData,
    disabled: !objectPermissions.canUpdateObjectRecords,
    transition: null,
    plugins: DND_KIT_PLUGINS_WITHOUT_OPTIMISTIC,
    feedback: 'clone',
  });

  return (
    <StyledDraggableRow
      $isDragSourceFaded={isDragSource || isSecondaryDragged}
      onDragStart={preventNativeDragStart}
    >
      <RecordListRow recordId={recordId} rowRef={ref} />
      {!isDragSource && (
        <StyledRowDropTargetSlot>
          <DragDropItemDropTarget
            index={index}
            droppableId={droppableId}
            orientation="horizontal"
            compact
            seamAligned
          />
        </StyledRowDropTargetSlot>
      )}
    </StyledDraggableRow>
  );
};
