import { styled } from '@linaria/react';
import { Fragment } from 'react';

import { RecordBoardAddGroupColumn } from '@/object-record/record-board/components/RecordBoardAddGroupColumn';
import { RecordBoardColumnHeaderWrapper } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderWrapper';
import { RECORD_BOARD_COLUMN_DROPPABLE_ID } from '@/object-record/record-board/record-board-column/dnd/constants/RecordBoardColumnDroppableId';
import { RecordBoardColumnDndKitProvider } from '@/object-record/record-board/record-board-column/dnd/providers/RecordBoardColumnDndKitProvider';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { ViewType } from '@/views/types/ViewType';

const StyledDropTargetSlot = styled.div`
  align-self: stretch;
  flex: 0 0 2px;
  margin-left: -1px;
  margin-right: -1px;
  min-height: 0;
  position: relative;
  z-index: 100;
`;

export const RecordBoardColumnDnd = () => {
  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.KANBAN,
  );

  return (
    <RecordBoardColumnDndKitProvider>
      <StyledDropTargetSlot>
        <DragDropItemDropTarget index={0} orientation="vertical" overlay />
      </StyledDropTargetSlot>
      {visibleRecordGroupIds.map((recordGroupId, index) => (
        <Fragment key={recordGroupId}>
          <DragDropItemSortableCell
            id={recordGroupId}
            index={index}
            group={RECORD_BOARD_COLUMN_DROPPABLE_ID}
            fill
            restrictMovementTo="x"
          >
            <RecordGroupContext.Provider value={{ recordGroupId }}>
              <RecordBoardColumnHeaderWrapper
                columnId={recordGroupId}
                columnIndex={index}
              />
            </RecordGroupContext.Provider>
          </DragDropItemSortableCell>
          <StyledDropTargetSlot>
            <DragDropItemDropTarget
              index={index + 1}
              orientation="vertical"
              overlay
            />
          </StyledDropTargetSlot>
        </Fragment>
      ))}
      <RecordBoardAddGroupColumn />
    </RecordBoardColumnDndKitProvider>
  );
};
