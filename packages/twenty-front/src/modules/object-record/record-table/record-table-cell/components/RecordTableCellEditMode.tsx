import { ReactElement } from 'react';
import styled from '@emotion/styled';

const StyledEditableCellEditModeContainer = styled.div<TableCellEditModeProps>`
  align-items: center;
  display: flex;
  min-width: 200px;
  width: calc(100% + 2px);
  z-index: 1;
`;

export type TableCellEditModeProps = {
  children: ReactElement;
  transparent?: boolean;
  maxContentWidth?: number;
  editModeHorizontalAlign?: 'left' | 'right';
  editModeVerticalPosition?: 'over' | 'below';
  initialValue?: string;
};

export const TableCellEditMode = ({
  editModeHorizontalAlign,
  editModeVerticalPosition,
  children,
}: TableCellEditModeProps) => (
  <StyledEditableCellEditModeContainer
    data-testid="editable-cell-edit-mode-container"
    editModeHorizontalAlign={editModeHorizontalAlign}
    editModeVerticalPosition={editModeVerticalPosition}
  >
    {children}
  </StyledEditableCellEditModeContainer>
);
