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
    max-width: 0;
    opacity: 0;
    pointer-events: none;
    transition: all ease-in-out 160ms;
  }

  &[data-selected='true'] .checkbox-container,
  &:hover .checkbox-container {
    max-width: ${themeCssVariables.spacing[6]};
    opacity: 1;
    pointer-events: auto;
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
