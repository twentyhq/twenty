import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { DragDropColumnDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropColumnDndContext';

const StyledDropTarget = styled.div<{
  $compact?: boolean;
  $overlay?: boolean;
}>`
  height: 100%;
  min-height: ${({ $compact }) =>
    $compact ? '100%' : themeCssVariables.spacing[2]};
  position: ${({ $overlay }) => ($overlay ? 'absolute' : 'relative')};
  transition: background-color 120ms ease-out;
  width: 100%;

  &::before {
    background-color: ${themeCssVariables.color.blue};
    border-radius: 0 ${themeCssVariables.border.radius.sm}
      ${themeCssVariables.border.radius.sm} 0;
    content: '';
    height: 100%;
    left: 0;
    opacity: 0;
    position: absolute;
    top: 0;
    transform: scaleY(0.7);
    transform-origin: center;
    transition:
      opacity 120ms ease-out,
      transform 120ms ease-out;
    width: 2px;
  }

  &[data-drag-over='true'] {
    background-color: ${themeCssVariables.background.transparent.blue};
  }

  &[data-drag-over='true']::before {
    opacity: 1;
    transform: scaleY(1);
  }
`;

type DragDropColumnDropTargetProps = {
  children?: ReactNode;
  compact?: boolean;
  index: number;
  overlay?: boolean;
};

export const DragDropColumnDropTarget = ({
  children,
  compact = false,
  index,
  overlay = false,
}: DragDropColumnDropTargetProps) => {
  const { activeDropTargetIndex } = useContext(DragDropColumnDndContext);

  const isDragOver = activeDropTargetIndex === index;

  return (
    <StyledDropTarget
      $compact={compact}
      $overlay={overlay}
      data-drag-over={isDragOver ? 'true' : undefined}
    >
      {children}
    </StyledDropTarget>
  );
};
