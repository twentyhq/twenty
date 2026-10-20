import { styled } from '@linaria/react';
import { type CSSProperties, type ReactNode, type Ref } from 'react';

import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';

// top rather than transform: a transformed ancestor would anchor the cells' fixed-position dropdowns
const StyledRowSlotContainer = styled.div`
  height: ${RECORD_TABLE_ROW_HEIGHT + 1}px;
  position: absolute;
`;

type RecordTableRowSlotContainerProps = {
  ref?: Ref<HTMLDivElement>;
  style?: CSSProperties;
  children: ReactNode;
};

export const RecordTableRowSlotContainer = ({
  ref,
  style,
  children,
}: RecordTableRowSlotContainerProps) => (
  <StyledRowSlotContainer
    ref={ref}
    style={style}
    data-replay-ignore-mutations="true"
  >
    {children}
  </StyledRowSlotContainer>
);
