import { styled } from '@linaria/react';
import { useContext } from 'react';

import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidthClassName';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableRowDraggableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { DragDropItemSortableHandleRefContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemSortableHandleRefContext';
import { IconListViewGrip } from 'twenty-ui/input';

const StyledContainer = styled.div`
  border-color: transparent;
  cursor: grab;
  display: flex;
  height: ${RECORD_TABLE_ROW_HEIGHT}px;

  &:hover .icon {
    opacity: 1;
  }

  z-index: ${TABLE_Z_INDEX.columnGrip};
`;

const StyledIconWrapper = styled.div<{ isDragging: boolean }>`
  opacity: ${({ isDragging }) => (isDragging ? 1 : 0)};
  transition: opacity 0.1s;
  svg path {
    fill: ${themeCssVariables.border.color.strong};
  }
`;

export const RecordTableCellDragAndDrop = () => {
  const { isDragging } = useRecordTableRowDraggableContextOrThrow();

  const sortableHandleRef = useContext(DragDropItemSortableHandleRefContext);

  return (
    <RecordTableCellStyleWrapper
      data-select-disable
      hasRightBorder={false}
      hasBottomBorder={false}
      widthClassName={RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH_CLASS_NAME}
    >
      <StyledContainer ref={sortableHandleRef}>
        <StyledIconWrapper className="icon" isDragging={isDragging}>
          <IconListViewGrip />
        </StyledIconWrapper>
      </StyledContainer>
    </RecordTableCellStyleWrapper>
  );
};
