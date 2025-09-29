import styled from '@emotion/styled';

import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidthClassName';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableRowDraggableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { IconListViewGrip } from 'twenty-ui/input';

const StyledContainer = styled.div`
  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  border-color: transparent;
  cursor: grab;
  display: flex;

  &:hover .icon {
    opacity: 1;
  }

  z-index: ${TABLE_Z_INDEX.columnGrip};
`;

const StyledIconWrapper = styled.div<{ isDragging: boolean }>`
  opacity: ${({ isDragging }) => (isDragging ? 1 : 0)};
  transition: opacity 0.1s;
  svg path {
    fill: ${({ theme }) => theme.border.color.strong};
  }
`;

export const RecordTableCellDragAndDrop = () => {
  const { dragHandleProps, isDragging } =
    useRecordTableRowDraggableContextOrThrow();

  return (
    <RecordTableCellStyleWrapper
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...dragHandleProps}
      data-select-disable
      hasRightBorder={false}
      hasBottomBorder={false}
      widthClassName={RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH_CLASS_NAME}
    >
      <StyledContainer>
        <StyledIconWrapper className="icon" isDragging={isDragging}>
          <IconListViewGrip />
        </StyledIconWrapper>
      </StyledContainer>
    </RecordTableCellStyleWrapper>
  );
};
