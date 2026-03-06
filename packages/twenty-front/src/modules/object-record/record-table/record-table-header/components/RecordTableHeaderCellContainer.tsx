import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledHeaderCell = styled.div<{
  zIndex?: number;
  shouldDisplayBorderBottom: boolean;
  isResizing: boolean;
}>`
  background-color: ${themeCssVariables.background.primary};
  border-bottom: ${({ shouldDisplayBorderBottom }) =>
    shouldDisplayBorderBottom
      ? `1px solid ${themeCssVariables.border.color.light}`
      : 'none'};
  border-right: 1px solid ${themeCssVariables.border.color.light};

  color: ${themeCssVariables.font.color.tertiary};

  cursor: ${({ isResizing }) => (isResizing ? 'col-resize' : 'pointer')};
  height: ${RECORD_TABLE_ROW_HEIGHT}px;

  max-height: ${RECORD_TABLE_ROW_HEIGHT}px;
  padding: 0;

  position: relative;

  text-align: left;

  &:hover {
    background: ${({ isResizing }) =>
      isResizing
        ? themeCssVariables.background.primary
        : themeCssVariables.background.secondary};
  }

  &:active {
    background: ${({ isResizing }) =>
      isResizing
        ? themeCssVariables.background.primary
        : themeCssVariables.background.tertiary};
  }

  user-select: none;

  z-index: ${({ zIndex }) => zIndex ?? 'auto'};
`;

export const RecordTableHeaderCellContainer = StyledHeaderCell;
