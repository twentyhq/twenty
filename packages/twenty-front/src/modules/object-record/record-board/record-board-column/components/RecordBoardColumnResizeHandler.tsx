import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

import { useResizeBoardColumn } from '@/object-record/record-board/record-board-column/hooks/useResizeBoardColumn';

const StyledResizeHandler = styled.div<{ isResizing: boolean }>`
  bottom: 0;
  cursor: col-resize;
  position: absolute;
  right: -1px;
  top: 0;
  width: 10px;
  z-index: 1;

  &:after {
    background-color: ${themeCssVariables.color.blue};
    bottom: 0;
    content: '';
    display: ${({ isResizing }) => (isResizing ? 'block' : 'none')};
    position: absolute;
    right: -1px;
    top: 0;
    width: 2px;
  }
`;

export const RecordBoardColumnResizeHandler = () => {
  const isMobile = useIsMobile();

  const { isResizing, handleResizeStart } = useResizeBoardColumn();

  if (isMobile) {
    return null;
  }

  return (
    <StyledResizeHandler
      className="cursor-col-resize"
      role="separator"
      aria-orientation="vertical"
      onPointerDown={handleResizeStart}
      isResizing={isResizing}
    />
  );
};
