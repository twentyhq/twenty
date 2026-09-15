import { useCallback, useState } from 'react';

import { getUiZoom } from '@/ui/theme/utils/getUiZoom';
import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';
import { type PointerEventListener } from '@/ui/utilities/pointer-event/types/PointerEventListener';

import { RESIZE_DRAG_THRESHOLD_PX } from '@/ui/layout/resizable-panel/constants/ResizeDragThresholdPx';
import { type ResizablePanelConstraints } from '@/ui/layout/resizable-panel/types/ResizablePanelConstraints';
import { type ResizablePanelSide } from '@/ui/layout/resizable-panel/types/ResizablePanelSide';

type UseResizablePanelProps = {
  side: ResizablePanelSide;
  constraints: ResizablePanelConstraints;
  currentWidth: number;
  onWidthChange: (width: number) => void;
  onCollapse: () => void;
  cssVariableName?: string;
  onResizeStart?: () => void;
};

const clampWidth = (width: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, width));

export const useResizablePanel = ({
  side,
  constraints,
  currentWidth,
  onWidthChange,
  onCollapse,
  cssVariableName,
  onResizeStart,
}: UseResizablePanelProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);
  const [startWidth, setStartWidth] = useState<number>(0);
  const [hasDragged, setHasDragged] = useState(false);

  // captured once per drag: reading computed style on every move would
  // force a synchronous style recalc, and the zoom cannot change mid-drag
  const [dragUiZoom, setDragUiZoom] = useState(1);

  const handleResizeMove = useCallback<PointerEventListener>(
    ({ x }) => {
      if (startX === null) return;

      const deltaX = (x - startX) / dragUiZoom;

      if (!hasDragged && Math.abs(deltaX) > RESIZE_DRAG_THRESHOLD_PX) {
        setHasDragged(true);
        onResizeStart?.();
      }

      if (Math.abs(deltaX) > RESIZE_DRAG_THRESHOLD_PX) {
        const widthDelta = side === 'right' ? deltaX : -deltaX;
        const clampedWidth = clampWidth(
          startWidth + widthDelta,
          constraints.min,
          constraints.max,
        );

        if (cssVariableName !== undefined) {
          document.documentElement.style.setProperty(
            cssVariableName,
            `${clampedWidth}px`,
          );
        }
      }
    },
    [
      dragUiZoom,
      startX,
      startWidth,
      hasDragged,
      side,
      constraints.min,
      constraints.max,
      cssVariableName,
      onResizeStart,
    ],
  );

  const handleResizeEnd = useCallback<PointerEventListener>(
    ({ x }) => {
      if (startX === null) {
        setIsResizing(false);
        return;
      }

      const deltaX = (x - startX) / dragUiZoom;

      if (!hasDragged) {
        onCollapse();
      } else {
        const widthDelta = side === 'right' ? deltaX : -deltaX;
        const finalWidth = clampWidth(
          startWidth + widthDelta,
          constraints.min,
          constraints.max,
        );
        onWidthChange(finalWidth);
      }

      setStartX(null);
      setIsResizing(false);
    },
    [
      dragUiZoom,
      startX,
      startWidth,
      hasDragged,
      side,
      constraints.min,
      constraints.max,
      onCollapse,
      onWidthChange,
    ],
  );

  useTrackPointer({
    shouldTrackPointer: isResizing,
    onMouseMove: handleResizeMove,
    onMouseUp: handleResizeEnd,
  });

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      setDragUiZoom(getUiZoom());
      setStartX(event.clientX);
      setStartWidth(currentWidth);
      setHasDragged(false);
      setIsResizing(true);
    },
    [currentWidth],
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return {
    isHovered,
    isResizing,
    handleMouseDown,
    handleMouseEnter,
    handleMouseLeave,
  };
};
