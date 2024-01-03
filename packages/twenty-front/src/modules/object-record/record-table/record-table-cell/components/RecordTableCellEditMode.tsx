import { ReactElement } from 'react';
import styled from '@emotion/styled';

const StyledEditableCellEditModeContainer = styled.div<RecordTableCellEditModeProps>`
  align-items: center;
  display: flex;
  min-width: 200px;
  width: calc(100% + 2px);
  z-index: 1;
`;

export type RecordTableCellEditModeProps = {
  children: ReactElement;
  transparent?: boolean;
  maxContentWidth?: number;
  editModeHorizontalAlign?: 'left' | 'right';
  editModeVerticalPosition?: 'over' | 'below';
  initialValue?: string;
};

export const RecordTableCellEditMode = ({
  editModeHorizontalAlign,
  editModeVerticalPosition,
  children,
}: RecordTableCellEditModeProps) => (
  <StyledEditableCellEditModeContainer
    data-testid="editable-cell-edit-mode-container"
    editModeHorizontalAlign={editModeHorizontalAlign}
    editModeVerticalPosition={editModeVerticalPosition}
  >
    {children}
  </StyledEditableCellEditModeContainer>
);
