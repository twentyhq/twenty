import { styled } from '@linaria/react';

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

export const RecordTableCellPortalRootContainer =
  StyledRecordTableCellPortalRootContainer;
