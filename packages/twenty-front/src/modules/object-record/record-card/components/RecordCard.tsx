import styled from '@emotion/styled';

const StyledBoardCard = styled.div<{
  isDragging?: boolean;
  isSecondaryDragged?: boolean;
  isPrimaryMultiDrag?: boolean;
}>`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  width: 100%;

  ${({ isSecondaryDragged }) =>
    isSecondaryDragged &&
    `
    opacity: 0.3;
  `}

  &[data-selected='true'] {
    background-color: ${({ theme }) => theme.accent.quaternary};
  }

  &[data-focused='true'] {
    background-color: ${({ theme }) => theme.background.tertiary};
  }

  &[data-active='true'] {
    background-color: ${({ theme }) => theme.accent.quaternary};
    border: 1px solid ${({ theme }) => theme.color.blue7};
  }

  &:hover {
    border: 1px solid ${({ theme }) => theme.border.color.strong};

    &[data-active='true'] {
      border: 1px solid ${({ theme }) => theme.color.blue7};
    }
  }

  .checkbox-container {
    display: none; 
    transition: all ease-in-out 160ms;
    opacity: 0;
  }

  .compact-icon-container {
    transition: all ease-in-out 160ms;
    opacity: 0;
    display: none;
  }
  .icons-container {
    display: none; 
  }
    
  &:hover .icons-container {
    opacity: 1;
    display: flex;
  }

  &:hover .record-chip-container {
    max-width: calc(100% - 20px);
  }
`;

export { StyledBoardCard as RecordCard };
