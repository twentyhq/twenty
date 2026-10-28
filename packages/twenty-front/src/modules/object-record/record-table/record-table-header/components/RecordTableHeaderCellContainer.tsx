import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledHeaderCell = styled.div<{
  shouldDisplayBorderBottom: boolean;
  isResizing: boolean;
  isReadOnly: boolean;
}>`
  background-color: ${themeCssVariables.background.secondary};
  border-bottom: ${({ shouldDisplayBorderBottom }) =>
    shouldDisplayBorderBottom
      ? `1px solid ${themeCssVariables.border.color.medium}`
      : 'none'};
  border-right: 1px solid ${themeCssVariables.border.color.light};

  color: ${themeCssVariables.font.color.tertiary};

  cursor: ${({ isResizing, isReadOnly }) =>
    isReadOnly ? 'default' : isResizing ? 'col-resize' : 'pointer'};
  height: ${RECORD_TABLE_ROW_HEIGHT}px;

  max-height: ${RECORD_TABLE_ROW_HEIGHT}px;
  padding: 0;

  position: relative;

  text-align: left;
  transition: background-color 120ms ease-out;

  @media (hover: hover) {
    &:hover {
      background: ${({ isResizing, isReadOnly }) =>
        isReadOnly || isResizing
          ? themeCssVariables.background.secondary
          : themeCssVariables.background.tertiary};
    }
  }

  &:active {
    background: ${({ isResizing, isReadOnly }) =>
      isReadOnly || isResizing
        ? themeCssVariables.background.secondary
        : themeCssVariables.background.quaternary};
  }

  user-select: none;
`;

export const RecordTableHeaderCellContainer = StyledHeaderCell;
