import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import styled from '@emotion/styled';

const StyledHeaderCell = styled.div<{
  isFirstRowActiveOrFocused: boolean;
  zIndex?: number;
}>`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: 0;
  text-align: left;

  position: relative;

  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  max-height: ${RECORD_TABLE_ROW_HEIGHT}px;

  background-color: ${({ theme }) => theme.background.primary};
  border-right: 1px solid ${({ theme }) => theme.border.color.light};

  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  user-select: none;
  ${({ theme }) => {
    return `
    &:hover {
      background: ${theme.background.secondary};
    };
    &:active {
      background: ${theme.background.tertiary};
    };
    `;
  }};

  z-index: ${({ zIndex }) => zIndex ?? 'auto'};
`;

export const RecordTableHeaderCellContainer = StyledHeaderCell;
