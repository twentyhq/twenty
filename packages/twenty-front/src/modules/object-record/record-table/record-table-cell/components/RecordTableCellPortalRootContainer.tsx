import { RECORD_TABLE_CELL_PORTAL_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableCellPortalClassName';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

const StyledRecordTableCellPortalRootContainer = styled.div<{
  zIndex?: number;
}>`
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: ${({ zIndex }) => zIndex ?? 'auto'};
`;

type RecordTableCellPortalRootContainerProps = {
  zIndex?: number;
  children: ReactNode;
};

export const RecordTableCellPortalRootContainer = ({
  zIndex,
  children,
}: RecordTableCellPortalRootContainerProps) => (
  <StyledRecordTableCellPortalRootContainer
    className={RECORD_TABLE_CELL_PORTAL_CLASS_NAME}
    zIndex={zIndex}
  >
    {children}
  </StyledRecordTableCellPortalRootContainer>
);
