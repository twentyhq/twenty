import { styled } from '@linaria/react';

import { useResizablePanel } from '@/ui/layout/resizable-panel/hooks/useResizablePanel';
import { type ResizablePanelConstraints } from '@/ui/layout/resizable-panel/types/ResizablePanelConstraints';
import { type ResizablePanelSide } from '@/ui/layout/resizable-panel/types/ResizablePanelSide';

// Horizontal padding offset by an equal negative margin keeps the resize
// handle grabbable even when the visual gap is 0, without shifting neighbors.
const StyledGap = styled.div<{ gapWidth: number }>`
  box-sizing: content-box;
  cursor: col-resize;
  flex-shrink: 0;
  height: 100%;
  margin: 0 -4px;
  padding: 0 4px;
  position: relative;
  transition: width 0.15s ease;
  width: ${({ gapWidth }) => gapWidth}px;
  z-index: 1;
`;

type ResizablePanelGapProps = {
  side: ResizablePanelSide;
  constraints: ResizablePanelConstraints;
  currentWidth: number;
  onWidthChange: (width: number) => void;
  onCollapse: () => void;
  gapWidth: number;
  cssVariableName?: string;
  onResizeStart?: () => void;
};

export const ResizablePanelGap = ({
  side,
  constraints,
  currentWidth,
  onWidthChange,
  onCollapse,
  gapWidth,
  cssVariableName,
  onResizeStart,
}: ResizablePanelGapProps) => {
  const { handleMouseDown, handleMouseEnter, handleMouseLeave } =
    useResizablePanel({
      side,
      constraints,
      currentWidth,
      onWidthChange,
      onCollapse,
      cssVariableName,
      onResizeStart,
    });

  return (
    <StyledGap
      gapWidth={gapWidth}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
};
