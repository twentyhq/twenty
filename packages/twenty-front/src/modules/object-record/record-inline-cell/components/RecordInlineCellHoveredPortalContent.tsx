import styled from '@emotion/styled';
import { BORDER_COMMON } from 'twenty-ui/theme';

const StyledRecordTableCellHoveredPortalContent = styled.div<{
  isReadOnly: boolean;
  isRowActive: boolean;
}>`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.secondary};
  background-color: ${({ theme, isRowActive }) =>
    isRowActive ? theme.accent.quaternary : theme.background.primary};
  border-radius: ${({ isReadOnly }) =>
    !isReadOnly ? BORDER_COMMON.radius.sm : 'none'};
  box-sizing: border-box;
  cursor: ${({ isReadOnly }) => (isReadOnly ? 'default' : 'pointer')};
  display: flex;

  height: 32px;

  outline: ${({ theme, isReadOnly, isRowActive }) =>
    isRowActive
      ? 'none'
      : isReadOnly
        ? `1px solid ${theme.border.color.medium}`
        : `1px solid ${theme.font.color.extraLight}`};

  position: relative;
  user-select: none;
`;

export const RecordInlineCellHoveredPortalContent =
  StyledRecordTableCellHoveredPortalContent;
