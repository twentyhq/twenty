import { useContext } from 'react';
import styled from '@emotion/styled';

import { GripCell } from '@/object-record/record-table/components/GripCell';
import { StyledRecordTableTd } from '@/object-record/record-table/components/StyledRecordTableTd';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';

const StyledRecordTableCellDraggable = styled(StyledRecordTableTd)<{
  isDragging: boolean;
}>`
  ${({ isDragging }) =>
    isDragging &&
    `
      background-color: transparent;
      border-color: transparent;
  `}
`;

export const RecordTableCellGrip = () => {
  const { dragHandleProps, isDragging } = useContext(RecordTableRowContext);

  return (
    <StyledRecordTableCellDraggable
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...dragHandleProps}
      data-select-disable
      isDragging={isDragging}
    >
      <GripCell isDragging={isDragging} />
    </StyledRecordTableCellDraggable>
  );
};
