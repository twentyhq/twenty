import { Draggable, Droppable } from '@hello-pangea/dnd';
import { RecordBoardAddGroupColumn } from '@/object-record/record-board/components/RecordBoardAddGroupColumn';
import { RECORD_BOARD_COLUMN_DND_TYPE } from '@/object-record/record-board/constants/RecordBoardColumnDndType';
import { RECORD_BOARD_COLUMN_DROPPABLE_ID } from '@/object-record/record-board/constants/RecordBoardColumnDroppableId';
import { RecordBoardColumnHeaderWrapper } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderWrapper';
import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { RecordIndexGroupAggregatesDataLoader } from '@/object-record/record-index/components/RecordIndexGroupAggregatesDataLoader';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { getCssCompatibleDraggableProps } from '@/ui/layout/draggable-list/utils/getCssCompatibleDraggableProps';
import { ViewType } from '@/views/types/ViewType';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 40px;
  overflow: visible;

  width: 100%;
  z-index: 10;

  &.header-sticky {
    position: sticky;
    top: 0;
  }

  & > *:not(:first-of-type) {
    border-left: 1px solid ${themeCssVariables.border.color.light};
  }
`;

export const RecordBoardHeader = () => {
  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.KANBAN,
  );

  return (
    <Droppable
      direction="horizontal"
      droppableId={RECORD_BOARD_COLUMN_DROPPABLE_ID}
      type={RECORD_BOARD_COLUMN_DND_TYPE}
    >
      {(droppableProvided) => (
        <StyledHeaderContainer
          id="record-board-header"
          ref={droppableProvided.innerRef}
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...droppableProvided.droppableProps}
        >
          {visibleRecordGroupIds.map((recordGroupId, index) => (
            <Draggable
              draggableId={recordGroupId}
              index={index}
              key={recordGroupId}
            >
              {(draggableProvided, draggableSnapshot) => (
                <div
                  ref={draggableProvided.innerRef}
                  // oxlint-disable-next-line react/jsx-props-no-spreading
                  {...getCssCompatibleDraggableProps(
                    draggableProvided.draggableProps,
                  )}
                >
                  <RecordGroupContext.Provider value={{ recordGroupId }}>
                    <RecordBoardColumnHeaderWrapper
                      columnId={recordGroupId}
                      columnIndex={index}
                      dragHandleProps={draggableProvided.dragHandleProps}
                      isDragging={draggableSnapshot.isDragging}
                    />
                  </RecordGroupContext.Provider>
                </div>
              )}
            </Draggable>
          ))}
          {droppableProvided.placeholder}
          <RecordBoardAddGroupColumn />
          <RecordIndexGroupAggregatesDataLoader />
        </StyledHeaderContainer>
      )}
    </Droppable>
  );
};
