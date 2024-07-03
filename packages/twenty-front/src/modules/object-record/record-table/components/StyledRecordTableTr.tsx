import styled from '@emotion/styled';

export const StyledRecordTableTr = styled.tr<{ isDragging: boolean }>`
  border: 1px solid transparent;
  transition: border-left-color 0.2s ease-in-out;

  td:nth-of-type(-n + 2) {
    border-right-color: ${({ theme }) => theme.background.primary};
  }
`;
