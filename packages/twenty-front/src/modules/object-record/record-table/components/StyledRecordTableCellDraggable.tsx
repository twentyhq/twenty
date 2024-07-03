import styled from '@emotion/styled';

import { StyledRecordTableTd } from '@/object-record/record-table/components/StyledRecordTableTd';

export const StyledRecordTableCellDraggable = styled(StyledRecordTableTd)<{
  isDragging: boolean;
}>`
  ${({ isDragging }) =>
    isDragging &&
    `
      background-color: transparent;
      border-color: transparent;
  `}
`;
