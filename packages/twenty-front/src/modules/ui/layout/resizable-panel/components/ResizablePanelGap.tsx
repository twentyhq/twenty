import styled from '@emotion/styled';

import { useResizablePanel } from '../hooks/useResizablePanel';
import {
  type ResizablePanelConstraints,
  type ResizablePanelSide,
} from '../types/ResizablePanelTypes';

const StyledGap = styled.div<{ gapWidth: number }>`
  cursor: col-resize;
  flex-shrink: 0;
  height: 100%;
  width: ${({ gapWidth }) => gapWidth}px;
  transition: width 0.15s ease;
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
