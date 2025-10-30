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
    transition: all ease-in-out 160ms;
    opacity: 0;
  }

  &[data-selected='true'] .checkbox-container {
    opacity: 1;
  }

  &:hover .checkbox-container {
    opacity: 1;
  }

  .compact-icon-container {
    transition: all ease-in-out 160ms;
    opacity: 0;
  }
  &:hover .compact-icon-container {
    opacity: 1;
  }
`;

export { StyledBoardCard as RecordCard };
