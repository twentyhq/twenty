import styled from '@emotion/styled';

export const StyledRecordTableTd = styled.td<{ isSelected?: boolean }>`
  background: ${({ theme }) => theme.background.primary};
  position: relative;
  user-select: none;

  ${({ isSelected, theme }) =>
    isSelected &&
    `
    background: ${theme.accent.quaternary};

  `}
`;
