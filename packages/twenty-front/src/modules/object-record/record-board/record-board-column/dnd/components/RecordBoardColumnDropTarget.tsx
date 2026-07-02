import { type ReactNode, useContext } from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { isDefined } from 'twenty-shared/utils';

import { RecordBoardColumnDndContext } from '@/object-record/record-board/record-board-column/dnd/context/RecordBoardColumnDndContext';

const StyledDropTarget = styled.div`
  height: 100%;
  min-height: 100%;
  position: absolute;
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

type RecordBoardColumnDropTargetProps = {
  children?: ReactNode;
  index: number;
};

export const RecordBoardColumnDropTarget = ({
  children,
  index,
}: RecordBoardColumnDropTargetProps) => {
  const { activeDropTargetIndex } = useContext(RecordBoardColumnDndContext);

  const isDragOver = isDefined(activeDropTargetIndex)
    ? activeDropTargetIndex === index
    : false;

  return (
    <StyledDropTarget data-drag-over={isDragOver ? 'true' : undefined}>
      {children}
    </StyledDropTarget>
  );
};
