import styled from '@emotion/styled';

const StyledTr = styled.tr<{ isDragging: boolean }>`
  border: ${({ isDragging, theme }) =>
    isDragging
      ? `1px solid ${theme.border.color.medium}`
      : '1px solid transparent'};
  transition: border-left-color 0.2s ease-in-out;
`;

export const RecordTableTr = StyledTr;
