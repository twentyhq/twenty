import React from 'react';

import { RecordBoardColumnHeaderWrapper } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderWrapper';
import { RecordBoardColumnDropTarget } from '@/object-record/record-board/record-board-column/dnd/components/RecordBoardColumnDropTarget';
import { RecordBoardColumnDroppableSlot } from '@/object-record/record-board/record-board-column/dnd/components/RecordBoardColumnDroppableSlot';
import { RecordBoardColumnSortableCell } from '@/object-record/record-board/record-board-column/dnd/components/RecordBoardColumnSortableCell';
import { RECORD_BOARD_COLUMN_DROPPABLE_ID } from '@/object-record/record-board/record-board-column/dnd/constants/RecordBoardColumnDroppableId';
import { RecordBoardColumnDndKitProvider } from '@/object-record/record-board/record-board-column/dnd/providers/RecordBoardColumnDndKitProvider';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { ViewType } from '@/views/types/ViewType';

export const RecordBoardColumnDnd = () => {
  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.KANBAN,
  );

  return (
    <RecordBoardColumnDndKitProvider>
      <RecordBoardColumnDroppableSlot
        droppableId={RECORD_BOARD_COLUMN_DROPPABLE_ID}
        index={0}
      >
        <RecordBoardColumnDropTarget index={0} />
      </RecordBoardColumnDroppableSlot>
      {visibleRecordGroupIds.map((recordGroupId, index) => (
        <React.Fragment key={recordGroupId}>
          <RecordBoardColumnSortableCell
            id={recordGroupId}
            index={index}
            group={RECORD_BOARD_COLUMN_DROPPABLE_ID}
          >
            <RecordGroupContext.Provider
              key={recordGroupId}
              value={{ recordGroupId }}
            >
              <RecordBoardColumnHeaderWrapper
                columnId={recordGroupId}
                columnIndex={index}
              />
            </RecordGroupContext.Provider>
          </RecordBoardColumnSortableCell>
          <RecordBoardColumnDroppableSlot
            droppableId={RECORD_BOARD_COLUMN_DROPPABLE_ID}
            index={index + 1}
          >
            <RecordBoardColumnDropTarget index={index + 1} />
          </RecordBoardColumnDroppableSlot>
        </React.Fragment>
      ))}
    </RecordBoardColumnDndKitProvider>
  );
};
