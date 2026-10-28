import { DRAG_SOURCE_OPACITY } from '@/ui/utilities/drag-and-drop/constants/DragSourceOpacity';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledBoardCard = styled.div<{
  isDragging?: boolean;
}>`
  --record-card-background-color: ${themeCssVariables.background.primary};

  background-color: var(--record-card-background-color);
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  opacity: ${({ isDragging }) => (isDragging ? DRAG_SOURCE_OPACITY : 1)};
  transition:
    border-color ease-in-out 160ms,
    box-shadow ease-in-out 160ms;

  width: 100%;

  &[data-selected='true'] {
    --record-card-background-color: ${themeCssVariables.accent.quaternary};
  }

  &[data-focused='true'] {
    --record-card-background-color: ${themeCssVariables.background.secondary};

    border-color: ${themeCssVariables.border.color.strong};
  }

  &[data-active='true'] {
    --record-card-background-color: ${themeCssVariables.accent.quaternary};

    border: 1px solid ${themeCssVariables.color.blue7};
  }

  &:hover {
    border: 1px solid ${themeCssVariables.border.color.medium};
    box-shadow: ${themeCssVariables.boxShadow.strong};

    &[data-active='true'] {
      border: 1px solid ${themeCssVariables.color.blue7};
    }
  }

  .checkbox-container {
    flex-shrink: 0;
    max-width: 0;
    opacity: 0;
    overflow: hidden;
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
