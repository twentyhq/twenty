import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

import { useResizeRecordBoardColumns } from '@/object-record/record-board/record-board-column/hooks/useResizeRecordBoardColumns';

const StyledResizeHandler = styled.div<{ isResizing: boolean }>`
  bottom: 0;
  cursor: col-resize;
  position: absolute;
  right: -5px;
  top: 0;
  width: 10px;
  z-index: 2;

  &:after {
    background-color: ${themeCssVariables.color.blue};
    bottom: 0;
    content: '';
    display: ${({ isResizing }) => (isResizing ? 'block' : 'none')};
    position: absolute;
    right: 4px;
    top: 0;
    width: 2px;
  }
`;

export const RecordBoardColumnResizeHandler = () => {
  const isMobile = useIsMobile();

  const { handleResizeStart, isResizing } = useResizeRecordBoardColumns();

  if (isMobile) {
    return null;
  }

  return (
    <StyledResizeHandler
      aria-orientation="vertical"
      className="cursor-col-resize"
      data-select-disable="true"
      isResizing={isResizing}
      onPointerDown={handleResizeStart}
      role="separator"
    />
  );
};
