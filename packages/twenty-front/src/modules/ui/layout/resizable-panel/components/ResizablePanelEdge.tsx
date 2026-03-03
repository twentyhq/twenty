import { styled } from '@linaria/react';

import { RESIZE_EDGE_WIDTH_PX } from '@/ui/layout/resizable-panel/constants/ResizeEdgeWidthPx';
import { useResizablePanel } from '@/ui/layout/resizable-panel/hooks/useResizablePanel';
import { type ResizablePanelConstraints } from '@/ui/layout/resizable-panel/types/ResizablePanelConstraints';
import { type ResizablePanelSide } from '@/ui/layout/resizable-panel/types/ResizablePanelSide';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type StyledEdgeProps = {
  isActive: boolean;
  isHovered: boolean;
  side: ResizablePanelSide;
};

const StyledEdge = styled.div<StyledEdgeProps>`
  position: absolute;
  top: 0;
  bottom: 0;
  ${({ side }) =>
    side === 'right' ? 'right' : 'left'}: -${RESIZE_EDGE_WIDTH_PX / 2}px;
  width: ${RESIZE_EDGE_WIDTH_PX}px;
  cursor: col-resize;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledHandle = styled.div<{ isActive: boolean; isHovered: boolean }>`
  width: 4px;
  height: 48px;
  border-radius: ${themeCssVariables.border.radius.pill};
  background-color: ${({ isActive, isHovered }) =>
    isActive
      ? themeCssVariables.color.blue
      : isHovered
        ? themeCssVariables.font.color.tertiary
        : themeCssVariables.background.quaternary};
  transition:
    background-color ${themeCssVariables.animation.duration.fast}s,
    transform ${themeCssVariables.animation.duration.fast}s;
  transform: ${({ isHovered, isActive }) =>
    isHovered || isActive ? 'scaleY(1.2)' : 'scaleY(1)'};
`;

type ResizablePanelEdgeProps = {
  side: ResizablePanelSide;
  constraints: ResizablePanelConstraints;
  currentWidth: number;
  onWidthChange: (width: number) => void;
  onCollapse: () => void;
  showHandle?: boolean;
  cssVariableName?: string;
  onResizeStart?: () => void;
};

export const ResizablePanelEdge = ({
  side,
  constraints,
  currentWidth,
  onWidthChange,
  onCollapse,
  showHandle = true,
  cssVariableName,
  onResizeStart,
}: ResizablePanelEdgeProps) => {
  const {
    isHovered,
    isResizing,
    handleMouseDown,
    handleMouseEnter,
    handleMouseLeave,
  } = useResizablePanel({
    side,
    constraints,
    currentWidth,
    onWidthChange,
    onCollapse,
    cssVariableName,
    onResizeStart,
  });

  return (
    <StyledEdge
      side={side}
      isActive={isResizing}
      isHovered={isHovered}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showHandle && (
        <StyledHandle isActive={isResizing} isHovered={isHovered} />
      )}
    </StyledEdge>
  );
};
