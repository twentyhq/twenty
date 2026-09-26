import { styled } from '@linaria/react';

import { RESIZE_EDGE_WIDTH_PX } from '@/ui/layout/resizable-panel/constants/ResizeEdgeWidthPx';
import { useResizablePanel } from '@/ui/layout/resizable-panel/hooks/useResizablePanel';
import { type ResizablePanelConstraints } from '@/ui/layout/resizable-panel/types/ResizablePanelConstraints';
import { type ResizablePanelSide } from '@/ui/layout/resizable-panel/types/ResizablePanelSide';
import { themeCssVariables } from 'twenty-ui/theme';

type StyledEdgeProps = {
  isActive: boolean;
  isHovered: boolean;
  side: ResizablePanelSide;
};

const StyledEdge = styled.div<StyledEdgeProps>`
  align-items: center;
  bottom: ${({ side }) => (side === 'top' ? 'auto' : '0')};
  cursor: ${({ side }) => (side === 'top' ? 'row-resize' : 'col-resize')};
  display: flex;
  height: ${({ side }) =>
    side === 'top' ? `${RESIZE_EDGE_WIDTH_PX}px` : 'auto'};
  justify-content: center;
  left: ${({ side }) =>
    side === 'left' ? `-${RESIZE_EDGE_WIDTH_PX / 2}px` : 'auto'};
  position: absolute;

  right: ${({ side }) =>
    side === 'right' ? `-${RESIZE_EDGE_WIDTH_PX / 2}px` : 'auto'};
  top: 0;
  width: ${({ side }) =>
    side === 'top' ? '100%' : `${RESIZE_EDGE_WIDTH_PX}px`};
`;

const StyledHandle = styled.div<{
  isActive: boolean;
  isHovered: boolean;
  side: ResizablePanelSide;
}>`
  background-color: ${({ isActive, isHovered }) =>
    isActive
      ? themeCssVariables.color.blue
      : isHovered
        ? themeCssVariables.font.color.tertiary
        : themeCssVariables.background.quaternary};
  border-radius: ${themeCssVariables.border.radius.pill};
  corner-shape: round;
  height: ${({ side }) => (side === 'top' ? '3px' : '48px')};
  transform: ${({ isHovered, isActive, side }) => {
    const scale = isHovered || isActive ? 1.2 : 1;

    return side === 'top' ? `scaleX(${scale})` : `scaleY(${scale})`;
  }};
  transition:
    background-color ${themeCssVariables.animation.duration.fast}s,
    transform ${themeCssVariables.animation.duration.fast}s;
  width: ${({ side }) => (side === 'top' ? '48px' : '4px')};
`;

type ResizablePanelEdgeProps = {
  side: ResizablePanelSide;
  constraints: ResizablePanelConstraints;
  currentSize: number;
  onSizeChange: (size: number) => void;
  showHandle?: boolean;
  cssVariableName?: string;
  onResizeStart?: (size: number) => void;
};

export const ResizablePanelEdge = ({
  side,
  constraints,
  currentSize,
  onSizeChange,
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
    currentSize,
    onSizeChange,
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
        <StyledHandle side={side} isActive={isResizing} isHovered={isHovered} />
      )}
    </StyledEdge>
  );
};
