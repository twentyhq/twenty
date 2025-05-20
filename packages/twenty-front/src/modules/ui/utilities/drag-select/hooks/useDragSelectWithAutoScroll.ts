import { RefObject, useState } from 'react';

import { isDefined } from 'twenty-shared/utils';
import {
    AUTO_SCROLL_EDGE_THRESHOLD_PX,
    AUTO_SCROLL_MAX_SPEED_PX,
} from '../constants/autoScrollParams';
import { clamp } from '../utils/clamp';
import { DOMVector } from '../utils/DOMVector';

type UseDragSelectWithAutoScrollProps = {
  selectableAreaRef: RefObject<HTMLElement>;
};

export const useDragSelectWithAutoScroll = ({
  selectableAreaRef,
}: UseDragSelectWithAutoScrollProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragVector, setDragVector] = useState<DOMVector | null>(null);

  const handleDragStart = (event: MouseEvent) => {
    const initialPoint = { x: event.clientX, y: event.clientY };

    setIsDragging(true);

    const startVector = new DOMVector(initialPoint.x, initialPoint.y, 0, 0);
    setDragVector(startVector);

    let currentVector = startVector;

    let parent = selectableAreaRef.current?.parentElement ?? null;
    let scrollWrapper: HTMLElement | null = null;
    while (parent !== null) {
      const style = window.getComputedStyle(parent);
      const hasScroll =
        ['auto', 'scroll'].includes(style.overflowY) ||
        ['auto', 'scroll'].includes(style.overflow);

      if (hasScroll) {
        scrollWrapper = parent;
        break;
      }
      parent = parent.parentElement;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const currentPoint = { x: e.clientX, y: e.clientY };
      currentVector = new DOMVector(
        initialPoint.x,
        initialPoint.y,
        currentPoint.x - initialPoint.x,
        currentPoint.y - initialPoint.y,
      );
      setDragVector(currentVector);
    };

    document.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number | null = null;
    const scrollTheLad = () => {
      if (!isDefined(scrollWrapper)) {
        animationFrameId = requestAnimationFrame(scrollTheLad);
        return;
      }

      const currentPointer = currentVector.toTerminalPoint();
      const containerRect = scrollWrapper.getBoundingClientRect();

      const shouldScrollRight =
        containerRect.width - (currentPointer.x - containerRect.left) <
        AUTO_SCROLL_EDGE_THRESHOLD_PX;
      const shouldScrollLeft =
        currentPointer.x - containerRect.left < AUTO_SCROLL_EDGE_THRESHOLD_PX;
      const shouldScrollDown =
        containerRect.height - (currentPointer.y - containerRect.top) <
        AUTO_SCROLL_EDGE_THRESHOLD_PX;
      const shouldScrollUp =
        currentPointer.y - containerRect.top < AUTO_SCROLL_EDGE_THRESHOLD_PX;

      const left = shouldScrollRight
        ? clamp(
            AUTO_SCROLL_EDGE_THRESHOLD_PX -
              containerRect.width +
              (currentPointer.x - containerRect.left),
            0,
            AUTO_SCROLL_MAX_SPEED_PX,
          )
        : shouldScrollLeft
          ? -1 *
            clamp(
              AUTO_SCROLL_EDGE_THRESHOLD_PX -
                (currentPointer.x - containerRect.left),
              0,
              AUTO_SCROLL_MAX_SPEED_PX,
            )
          : undefined;

      const top = shouldScrollDown
        ? clamp(
            AUTO_SCROLL_EDGE_THRESHOLD_PX -
              containerRect.height +
              (currentPointer.y - containerRect.top),
            0,
            AUTO_SCROLL_MAX_SPEED_PX,
          )
        : shouldScrollUp
          ? -1 *
            clamp(
              AUTO_SCROLL_EDGE_THRESHOLD_PX -
                (currentPointer.y - containerRect.top),
              0,
              AUTO_SCROLL_MAX_SPEED_PX,
            )
          : undefined;

      const shouldScroll = isDefined(top) || isDefined(left);

      if (shouldScroll) {
        scrollWrapper.scrollBy({
          left: left ?? 0,
          top: top ?? 0,
          behavior: 'auto',
        });
      }

      animationFrameId = requestAnimationFrame(scrollTheLad);
    };

    animationFrameId = requestAnimationFrame(scrollTheLad);

    const cleanup = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (isDefined(animationFrameId)) {
        cancelAnimationFrame(animationFrameId);
      }

      setIsDragging(false);
      setDragVector(null);
    };

    document.addEventListener('mouseup', cleanup, { once: true });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragVector(null);
  };

  return {
    isDragging,
    dragVector,
    handleDragStart,
    handleDragEnd,
  };
};
