import styled from '@emotion/styled';

import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableRowDraggableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';
import { IconListViewGrip } from 'twenty-ui/input';

export const TABLE_CELL_GRIP_WIDTH = 16;

const StyledContainer = styled.div`
  height: 32px;
  width: ${TABLE_CELL_GRIP_WIDTH};
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

export const RecordTableCellGrip = () => {
  const { dragHandleProps, isDragging } =
    useRecordTableRowDraggableContextOrThrow();

  return (
    <RecordTableTd
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...dragHandleProps}
      data-select-disable
      hasRightBorder={false}
      hasBottomBorder={false}
      width={TABLE_CELL_GRIP_WIDTH}
    >
      <StyledContainer>
        <StyledIconWrapper className="icon" isDragging={isDragging}>
          <IconListViewGrip />
        </StyledIconWrapper>
      </StyledContainer>
    </RecordTableTd>
  );
};
