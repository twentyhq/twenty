import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledBoardCard = styled.div<{
  isDragging?: boolean;
  isSecondaryDragged?: boolean;
  isPrimaryMultiDrag?: boolean;
}>`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  opacity: ${({ isSecondaryDragged }) => (isSecondaryDragged ? '0.3' : '1')};

  width: 100%;

  &[data-selected='true'] {
    background-color: ${themeCssVariables.accent.quaternary};
  }

  &[data-focused='true'] {
    background-color: ${themeCssVariables.background.tertiary};
  }

  &[data-active='true'] {
    background-color: ${themeCssVariables.accent.quaternary};
    border: 1px solid ${themeCssVariables.color.blue7};
  }

  &:hover {
    border: 1px solid ${themeCssVariables.border.color.strong};

    &[data-active='true'] {
      border: 1px solid ${themeCssVariables.color.blue7};
    }
  }

  .checkbox-container {
    opacity: 0;
    transition: all ease-in-out 160ms;
  }

  &[data-selected='true'] .checkbox-container {
    opacity: 1;
  }

  &:hover .checkbox-container {
    opacity: 1;
  }

  .compact-icon-container {
    opacity: 0;
    transition: all ease-in-out 160ms;
  }
  &:hover .compact-icon-container {
    opacity: 1;
  }
`;

export { StyledBoardCard as RecordCard };
