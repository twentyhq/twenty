import { ReactElement } from 'react';
import styled from '@emotion/styled';

const StyledEditableCellEditModeContainer = styled.div<TableCellEditModeProps>`
  align-items: center;
  display: flex;
  margin: -1px;
  max-width: ${({ maxContentWidth }) =>
    maxContentWidth ? `${maxContentWidth}px` : 'none'};
  min-height: 100%;
  min-width: ${({ maxContentWidth }) => (maxContentWidth ? `none` : '100%')};
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
  transparent = false,
  maxContentWidth,
}: TableCellEditModeProps) => (
  <StyledEditableCellEditModeContainer
    maxContentWidth={maxContentWidth}
    transparent={transparent}
    data-testid="editable-cell-edit-mode-container"
    editModeHorizontalAlign={editModeHorizontalAlign}
    editModeVerticalPosition={editModeVerticalPosition}
  >
    {children}
  </StyledEditableCellEditModeContainer>
);
