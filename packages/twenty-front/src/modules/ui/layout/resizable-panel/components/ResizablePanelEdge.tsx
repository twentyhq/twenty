import styled from '@emotion/styled';

import { RESIZE_EDGE_WIDTH_PX } from '@/ui/layout/resizable-panel/constants/ResizeEdgeWidthPx';
import { useResizablePanel } from '@/ui/layout/resizable-panel/hooks/useResizablePanel';
import { type ResizablePanelConstraints } from '@/ui/layout/resizable-panel/types/ResizablePanelConstraints';
import { type ResizablePanelSide } from '@/ui/layout/resizable-panel/types/ResizablePanelSide';

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
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledHandle = styled.div<{ isActive: boolean; isHovered: boolean }>`
  width: 4px;
  height: 48px;
  border-radius: ${({ theme }) => theme.border.radius.pill};
  background-color: ${({ theme, isActive, isHovered }) =>
    isActive
      ? theme.color.blue
      : isHovered
        ? theme.font.color.tertiary
        : theme.background.quaternary};
  transition:
    background-color ${({ theme }) => theme.animation.duration.fast}s,
    transform ${({ theme }) => theme.animation.duration.fast}s;
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
