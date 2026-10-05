import { useCallback, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { getUiZoom } from '@/ui/theme/utils/getUiZoom';
import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';
import { type PointerEventListener } from '@/ui/utilities/pointer-event/types/PointerEventListener';

import { RESIZE_DRAG_THRESHOLD_PX } from '@/ui/layout/resizable-panel/constants/ResizeDragThresholdPx';
import { type ResizablePanelConstraints } from '@/ui/layout/resizable-panel/types/ResizablePanelConstraints';
import { type ResizablePanelSide } from '@/ui/layout/resizable-panel/types/ResizablePanelSide';

type UseResizablePanelProps = {
  side: ResizablePanelSide;
  constraints: ResizablePanelConstraints;
  currentSize: number;
  onSizeChange: (size: number) => void;
  onCollapse?: () => void;
  cssVariableName?: string;
  onResizeStart?: (size: number) => void;
};

const clampSize = (size: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, size));

export const useResizablePanel = ({
  side,
  constraints,
  currentSize,
  onSizeChange,
  onCollapse,
  cssVariableName,
  onResizeStart,
}: UseResizablePanelProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startPointerPosition, setStartPointerPosition] = useState<
    number | null
  >(null);
  const [startSize, setStartSize] = useState<number>(0);
  // eslint-disable-next-line twenty/no-state-useref -- pointer callbacks read this synchronously; useState causes stale closures
  const hasDraggedRef = useRef(false);

  // reading computed style on every pointer move forces a synchronous style recalc; zoom cannot change mid-drag
  const [dragUiZoom, setDragUiZoom] = useState(1);

  const handleResizeMove = useCallback<PointerEventListener>(
    ({ x, y }) => {
      if (startPointerPosition === null) return;

      const pointerDelta =
        ((side === 'top' ? y : x) - startPointerPosition) / dragUiZoom;

      if (Math.abs(pointerDelta) <= RESIZE_DRAG_THRESHOLD_PX) {
        return;
      }

      const sizeDelta = side === 'right' ? pointerDelta : -pointerDelta;
      const clampedSize = clampSize(
        startSize + sizeDelta,
        constraints.min,
        constraints.max,
      );

      if (!hasDraggedRef.current) {
        hasDraggedRef.current = true;
        onResizeStart?.(clampedSize);
      }

      if (isDefined(cssVariableName)) {
        document.documentElement.style.setProperty(
          cssVariableName,
          `${clampedSize}px`,
        );
      }
    },
    [
      dragUiZoom,
      startPointerPosition,
      startSize,
      side,
      constraints.min,
      constraints.max,
      cssVariableName,
      onResizeStart,
    ],
  );

  const handleResizeEnd = useCallback<PointerEventListener>(
    ({ x, y }) => {
      if (startPointerPosition === null) {
        setIsResizing(false);
        return;
      }

      const pointerDelta =
        ((side === 'top' ? y : x) - startPointerPosition) / dragUiZoom;

      if (hasDraggedRef.current) {
        const sizeDelta = side === 'right' ? pointerDelta : -pointerDelta;
        const finalSize = clampSize(
          startSize + sizeDelta,
          constraints.min,
          constraints.max,
        );
        onSizeChange(finalSize);
      } else {
        onCollapse?.();
      }

      setStartPointerPosition(null);
      setIsResizing(false);
    },
    [
      dragUiZoom,
      startPointerPosition,
      startSize,
      side,
      constraints.min,
      constraints.max,
      onSizeChange,
      onCollapse,
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
      setStartPointerPosition(side === 'top' ? event.clientY : event.clientX);
      setStartSize(currentSize);
      hasDraggedRef.current = false;
      setIsResizing(true);
    },
    [side, currentSize],
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
