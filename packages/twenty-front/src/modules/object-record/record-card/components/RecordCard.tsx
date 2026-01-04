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
    opacity: 0;
    transition: all ease-in-out 160ms;
  }

  .compact-icon-container {
    display: none;
    opacity: 0;
    transition: all ease-in-out 160ms;
  }

  .icons-container {
    display: none;
  }

  &:hover .icons-container {
    display: flex;
    opacity: 1;
  }

  &:hover .record-chip-container {
    max-width: calc(100% - 20px);
  }
`;

export { StyledBoardCard as RecordCard };
