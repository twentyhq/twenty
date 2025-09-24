import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import styled from '@emotion/styled';

const StyledHeaderCell = styled.div<{
  zIndex?: number;
  shouldDisplayBorderBottom: boolean;
  isResizing: boolean;
}>`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: 0;
  text-align: left;

  position: relative;

  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  max-height: ${RECORD_TABLE_ROW_HEIGHT}px;

  background-color: ${({ theme }) => theme.background.primary};
  border-right: 1px solid ${({ theme }) => theme.border.color.light};

  border-bottom: ${({ theme, shouldDisplayBorderBottom }) =>
    shouldDisplayBorderBottom
      ? `1px solid ${theme.border.color.light}`
      : 'none'};

  user-select: none;
  ${({ theme, isResizing }) => {
    if (isResizing) {
      return '';
    }

    return `
    &:hover {
      background: ${theme.background.secondary};
    };
    &:active {
      background: ${theme.background.tertiary};
    };
    `;
  }};

  cursor: ${({ isResizing }) => (isResizing ? 'col-resize' : 'pointer')};

  z-index: ${({ zIndex }) => zIndex ?? 'auto'};
`;

export const RecordTableHeaderCellContainer = StyledHeaderCell;
