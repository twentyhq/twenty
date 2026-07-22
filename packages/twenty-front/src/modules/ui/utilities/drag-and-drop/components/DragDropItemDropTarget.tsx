import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { DragDropItemDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemDndContext';

type DragDropItemDropTargetOrientation = 'vertical' | 'horizontal';

const StyledDropTarget = styled.div<{
  $compact?: boolean;
  $overlay?: boolean;
}>`
  min-height: ${({ $compact }) =>
    $compact ? '0' : themeCssVariables.spacing[2]};
  position: ${({ $overlay }) => ($overlay ? 'absolute' : 'relative')};
  transition: background-color 120ms ease-out;

  &[data-orientation='vertical'] {
    height: 100%;
    width: 100%;
  }

  &[data-orientation='horizontal'] {
    width: 100%;
  }

  &::before {
    background-color: ${themeCssVariables.color.blue};
    border-radius: ${themeCssVariables.border.radius.sm};
    content: '';
    opacity: 0;
    position: absolute;
    transform-origin: center;
    transition:
      opacity 120ms ease-out,
      transform 120ms ease-out;
  }

  &[data-orientation='vertical']::before {
    height: 100%;
    left: 50%;
    top: 0;
    transform: translateX(-50%) scaleY(0.7);
    width: 2px;
  }

  &[data-orientation='horizontal']::before {
    height: 2px;
    left: 0;
    top: 50%;
    transform: translateY(calc(-50% - ${themeCssVariables.spacing[1]}))
      scaleX(0.7);
    width: 100%;
  }

  &[data-drag-over='true'] {
    background-color: ${themeCssVariables.background.transparent.blue};
  }

  &[data-orientation='vertical'][data-drag-over='true']::before {
    opacity: 1;
    transform: translateX(-50%) scaleY(1);
  }

  &[data-orientation='horizontal'][data-drag-over='true']::before {
    opacity: 1;
    transform: translateY(calc(-50% - ${themeCssVariables.spacing[1]}))
      scaleX(1);
  }

  &[data-orientation='horizontal'][data-leading='true']::before {
    top: 0;
    transform: scaleX(0.7);
    z-index: 1;
  }

  &[data-orientation='horizontal'][data-leading='true'][data-drag-over='true']::before {
    transform: scaleX(1);
  }
`;

type DragDropItemDropTargetProps = {
  children?: ReactNode;
  compact?: boolean;
  droppableId?: string;
  index: number;
  orientation?: DragDropItemDropTargetOrientation;
  overlay?: boolean;
};

export const DragDropItemDropTarget = ({
  children,
  compact = false,
  droppableId,
  index,
  orientation,
  overlay = false,
}: DragDropItemDropTargetProps) => {
  const { activeDropTargetIndex, activeDroppableId } = useContext(
    DragDropItemDndContext,
  );

  const matchesDroppable =
    !isDefined(droppableId) || activeDroppableId === droppableId;

  const isDragOver = activeDropTargetIndex === index && matchesDroppable;

  return (
    <StyledDropTarget
      $compact={compact}
      $overlay={overlay}
      data-orientation={orientation}
      data-leading={
        orientation === 'horizontal' && index === 0 ? 'true' : undefined
      }
      data-drag-over={isDragOver ? 'true' : undefined}
    >
      {children}
    </StyledDropTarget>
  );
};
