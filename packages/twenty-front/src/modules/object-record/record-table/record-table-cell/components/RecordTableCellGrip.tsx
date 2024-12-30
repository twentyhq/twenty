import styled from '@emotion/styled';

import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableRowDraggableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';
import { css } from '@emotion/react';
import { IconListViewGrip } from 'twenty-ui';

export const TABLE_CELL_GRIP_WIDTH = '16px';

const StyledContainer = styled.div<{ isPendingRow?: boolean }>`
  height: 32px;
  width: ${TABLE_CELL_GRIP_WIDTH};
  border-color: transparent;
  cursor: grab;
  display: flex;
  ${({ isPendingRow }) =>
    !isPendingRow
      ? css`
          &:hover .icon {
            opacity: 1;
          }
        `
      : ''};

  z-index: 200;
`;

const StyledIconWrapper = styled.div<{ isDragging: boolean }>`
  opacity: ${({ isDragging }) => (isDragging ? 1 : 0)};
  transition: opacity 0.1s;
`;

export const RecordTableCellGrip = () => {
  const { isPendingRow } = useRecordTableRowContextOrThrow();

  const { dragHandleProps, isDragging } =
    useRecordTableRowDraggableContextOrThrow();

  return (
    <RecordTableTd
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...dragHandleProps}
      data-select-disable
      hasRightBorder={false}
      hasBottomBorder={false}
    >
      <StyledContainer isPendingRow={isPendingRow}>
        <StyledIconWrapper className="icon" isDragging={isDragging}>
          <IconListViewGrip />
        </StyledIconWrapper>
      </StyledContainer>
    </RecordTableTd>
  );
};
