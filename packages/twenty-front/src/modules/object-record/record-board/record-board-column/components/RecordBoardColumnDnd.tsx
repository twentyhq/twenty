import { Fragment } from 'react';

import { RecordBoardAddGroupColumn } from '@/object-record/record-board/components/RecordBoardAddGroupColumn';
import { RecordBoardColumnHeaderWrapper } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderWrapper';
import { RECORD_BOARD_COLUMN_DROPPABLE_ID } from '@/object-record/record-board/record-board-column/dnd/constants/RecordBoardColumnDroppableId';
import { RecordBoardColumnDndKitProvider } from '@/object-record/record-board/record-board-column/dnd/providers/RecordBoardColumnDndKitProvider';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { DragDropColumnDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropColumnDropTarget';
import { DragDropColumnDroppableSlot } from '@/ui/utilities/drag-and-drop/components/DragDropColumnDroppableSlot';
import { DragDropColumnSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropColumnSortableCell';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { ViewType } from '@/views/types/ViewType';

export const RecordBoardColumnDnd = () => {
  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.KANBAN,
  );

  return (
    <RecordBoardColumnDndKitProvider>
      <DragDropColumnDroppableSlot
        droppableId={RECORD_BOARD_COLUMN_DROPPABLE_ID}
        index={0}
      >
        <DragDropColumnDropTarget index={0} compact overlay />
      </DragDropColumnDroppableSlot>
      {visibleRecordGroupIds.map((recordGroupId, index) => (
        <Fragment key={recordGroupId}>
          <DragDropColumnSortableCell
            id={recordGroupId}
            index={index}
            group={RECORD_BOARD_COLUMN_DROPPABLE_ID}
            fill
          >
            <RecordGroupContext.Provider value={{ recordGroupId }}>
              <RecordBoardColumnHeaderWrapper
                columnId={recordGroupId}
                columnIndex={index}
              />
            </RecordGroupContext.Provider>
          </DragDropColumnSortableCell>
          <DragDropColumnDroppableSlot
            droppableId={RECORD_BOARD_COLUMN_DROPPABLE_ID}
            index={index + 1}
          >
            <DragDropColumnDropTarget index={index + 1} compact overlay />
          </DragDropColumnDroppableSlot>
        </Fragment>
      ))}
      <RecordBoardAddGroupColumn />
    </RecordBoardColumnDndKitProvider>
  );
};
