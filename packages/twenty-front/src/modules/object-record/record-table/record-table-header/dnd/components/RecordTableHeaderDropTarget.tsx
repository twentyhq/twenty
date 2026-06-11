import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

import { RecordTableHeaderDndContext } from '@/object-record/record-table/record-table-header/dnd/context/RecordTableHeaderDndContext';
import { isDefined } from 'twenty-shared/utils';

const StyledDropTarget = styled.div<{
  $compact?: boolean;
}>`
  height: 100%;
  min-height: ${({ $compact }) =>
    $compact ? '100%' : themeCssVariables.spacing[2]};
  position: relative;
  transition: all 150ms ease-in-out;
  width: 100%;

  &[data-drag-over='true'] {
    background-color: ${themeCssVariables.background.transparent.blue};

    &::before {
      background-color: ${themeCssVariables.color.blue};
      border-radius: 0 ${themeCssVariables.border.radius.sm}
        ${themeCssVariables.border.radius.sm} 0;
      content: '';
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      width: 2px;
    }
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
  const { activeDraggedSourceIndex, activeDropTargetIndex } = useContext(
    RecordTableHeaderDndContext,
  );
  const isNoopDropTarget =
    isDefined(activeDraggedSourceIndex) &&
    (index === activeDraggedSourceIndex ||
      index === activeDraggedSourceIndex + 1);

  const isDragOver = isDefined(activeDropTargetIndex)
    ? activeDropTargetIndex === index && !isNoopDropTarget
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
