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
      content: '';
      position: absolute;
      height: 100%;
      top: 0;
      width: 2px;
      background-color: ${themeCssVariables.color.blue};
      left: 0;
      border-radius: 0 ${themeCssVariables.border.radius.sm}
        ${themeCssVariables.border.radius.sm} 0;
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
