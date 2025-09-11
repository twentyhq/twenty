import styled from '@emotion/styled';

const StyledHeaderCell = styled.div<{
  columnWidth: number;
  isResizing?: boolean;
  isFirstRowActiveOrFocused: boolean;
  zIndex?: number;
}>`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: 0;
  text-align: left;

  height: 32px;
  max-height: 32px;

  background-color: ${({ theme }) => theme.background.primary};
  border-right: 1px solid ${({ theme }) => theme.border.color.light};

  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  ${({ columnWidth }) => `
      min-width: ${columnWidth}px;
      width: ${columnWidth}px;
      `}
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
  ${({ isResizing, theme }) => {
    if (isResizing === true) {
      return `&:after {
        background-color: ${theme.color.blue};
        bottom: 0;
        content: '';
        display: block;
        position: absolute;
        right: -1px;
        top: 0;
        width: 2px;
      }`;
    }
  }};

  z-index: ${({ zIndex }) => zIndex ?? 'auto'};
`;

export const RecordTableHeaderCellContainer = StyledHeaderCell;
