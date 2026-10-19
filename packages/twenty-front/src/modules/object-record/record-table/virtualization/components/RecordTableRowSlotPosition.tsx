import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';

const StyledRowSlotPosition = styled.div`
  height: ${RECORD_TABLE_ROW_HEIGHT + 1}px;
  position: absolute;
`;

type RecordTableRowSlotPositionProps = {
  rowIndex: number;
  children: ReactNode;
};

// top rather than transform: a transformed ancestor would anchor the cells' fixed-position dropdowns
export const RecordTableRowSlotPosition = ({
  rowIndex,
  children,
}: RecordTableRowSlotPositionProps) => (
  <StyledRowSlotPosition
    style={{ top: (rowIndex + 1) * (RECORD_TABLE_ROW_HEIGHT + 1) }}
    data-replay-ignore-mutations="true"
  >
    {children}
  </StyledRowSlotPosition>
);
