import { styled } from '@linaria/react';
import { type PointerEvent as ReactPointerEvent } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledRecordColumnResizeHandle = styled.div<{
  isResizing: boolean;
  position: 'start' | 'end';
}>`
  bottom: 0;
  cursor: col-resize;
  inset-inline-end: ${({ position }) => (position === 'end' ? '-1px' : 'auto')};
  inset-inline-start: ${({ position }) =>
    position === 'start' ? '-1px' : 'auto'};
  position: absolute;
  top: 0;
  width: 10px;
  z-index: 1;

  &:after {
    background-color: ${themeCssVariables.color.blue};
    bottom: 0;
    content: '';
    display: ${({ isResizing }) => (isResizing ? 'block' : 'none')};
    inset-inline-end: ${({ position }) =>
      position === 'end' ? '-1px' : 'auto'};
    inset-inline-start: ${({ position }) =>
      position === 'start' ? '-1px' : 'auto'};
    position: absolute;
    top: 0;
    width: 2px;
  }
`;

type RecordColumnResizeHandleProps = {
  isResizing: boolean;
  position: 'start' | 'end';
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
};

export const RecordColumnResizeHandle = ({
  isResizing,
  position,
  onPointerDown,
}: RecordColumnResizeHandleProps) => (
  <StyledRecordColumnResizeHandle
    className="cursor-col-resize"
    role="separator"
    aria-orientation="vertical"
    data-dnd-drag-disable
    isResizing={isResizing}
    position={position}
    onPointerDown={onPointerDown}
  />
);
