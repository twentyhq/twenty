import { styled } from '@linaria/react';
import { type PointerEvent as ReactPointerEvent } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRecordColumnResizeHandle = styled.div<{
  isResizing: boolean;
  position: 'left' | 'right';
}>`
  bottom: 0;
  cursor: col-resize;
  left: ${({ position }) => (position === 'left' ? '-1px' : 'auto')};
  position: absolute;
  right: ${({ position }) => (position === 'right' ? '-1px' : 'auto')};
  top: 0;
  width: 10px;
  z-index: 1;

  &:after {
    background-color: ${themeCssVariables.color.blue};
    bottom: 0;
    content: '';
    display: ${({ isResizing }) => (isResizing ? 'block' : 'none')};
    left: ${({ position }) => (position === 'left' ? '-1px' : 'auto')};
    position: absolute;
    right: ${({ position }) => (position === 'right' ? '-1px' : 'auto')};
    top: 0;
    width: 2px;
  }
`;

type RecordColumnResizeHandleProps = {
  isResizing: boolean;
  position: 'left' | 'right';
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
    isResizing={isResizing}
    position={position}
    onPointerDown={onPointerDown}
  />
);
