import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledHeaderCell = styled.div<{
  zIndex?: number;
  shouldDisplayBorderBottom: boolean;
  isResizing: boolean;
}>`
  color: ${themeCssVariables.font.color.tertiary};
  padding: 0;
  text-align: left;

  position: relative;

  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  max-height: ${RECORD_TABLE_ROW_HEIGHT}px;

  background-color: ${themeCssVariables.background.primary};
  border-right: 1px solid ${themeCssVariables.border.color.light};

  border-bottom: ${({ shouldDisplayBorderBottom }) =>
    shouldDisplayBorderBottom
      ? `1px solid ${themeCssVariables.border.color.light}`
      : 'none'};

  user-select: none;

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

  cursor: ${({ isResizing }) => (isResizing ? 'col-resize' : 'pointer')};

  z-index: ${({ zIndex }) => zIndex ?? 'auto'};
`;

export const RecordTableHeaderCellContainer = StyledHeaderCell;
