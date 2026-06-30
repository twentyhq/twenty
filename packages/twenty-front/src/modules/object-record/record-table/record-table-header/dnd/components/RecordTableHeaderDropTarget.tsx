import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RecordTableHeaderDndContext } from '@/object-record/record-table/record-table-header/dnd/context/RecordTableHeaderDndContext';
import { isDefined } from 'twenty-shared/utils';

const StyledDropTarget = styled.div<{
  $compact?: boolean;
}>`
  height: 100%;
  min-height: ${({ $compact }) =>
    $compact ? '100%' : themeCssVariables.spacing[2]};
  position: relative;
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

type RecordTableHeaderDropTargetProps = {
  index: number;
  children?: ReactNode;
  compact?: boolean;
};

export const RecordTableHeaderDropTarget = ({
  index,
  children,
  compact = false,
}: RecordTableHeaderDropTargetProps) => {
  const { activeDropTargetIndex } = useContext(RecordTableHeaderDndContext);

  const isDragOver = isDefined(activeDropTargetIndex)
    ? activeDropTargetIndex === index
    : false;

  return (
    <StyledDropTarget
      $compact={compact}
      data-drag-over={isDragOver ? 'true' : undefined}
    >
      {children}
    </StyledDropTarget>
  );
};
