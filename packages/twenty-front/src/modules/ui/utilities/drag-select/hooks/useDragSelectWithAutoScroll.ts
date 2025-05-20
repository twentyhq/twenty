import { RefObject, useEffect, useState } from 'react';

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
  const [dragStartPoint, setDragStartPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (!isDragging || !selectableAreaRef.current || !dragStartPoint) {
      return;
    }

    let animationFrameId: number | null = null;
    let scrollWrapper: HTMLElement | null = null;

    let parent = selectableAreaRef.current.parentElement;
    while (parent) {
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

    const handleMouseMove = (event: MouseEvent) => {
      const currentPoint = { x: event.clientX, y: event.clientY };
      const newVector = new DOMVector(
        dragStartPoint.x,
        dragStartPoint.y,
        currentPoint.x - dragStartPoint.x,
        currentPoint.y - dragStartPoint.y,
      );

      setDragVector(newVector);
    };

    const scrollTheLad = () => {
      if (!scrollWrapper || !dragVector) {
        animationFrameId = requestAnimationFrame(scrollTheLad);
        return;
      }

      const currentPointer = dragVector.toTerminalPoint();
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

      const shouldScroll = top !== undefined || left !== undefined;

      if (shouldScroll) {
        scrollWrapper.scrollBy({
          left: left || 0,
          top: top || 0,
          behavior: 'auto',
        });
      }

      animationFrameId = requestAnimationFrame(scrollTheLad);
    };

    document.addEventListener('mousemove', handleMouseMove);
    animationFrameId = requestAnimationFrame(scrollTheLad);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);

      const shouldCancelAnimation = animationFrameId !== null;
      if (shouldCancelAnimation) {
        cancelAnimationFrame(animationFrameId as number);
      }
    };
  }, [isDragging, dragVector, dragStartPoint, selectableAreaRef]);

  const handleDragStart = (event: MouseEvent) => {
    const initialPoint = { x: event.clientX, y: event.clientY };
    setDragStartPoint(initialPoint);
    setIsDragging(true);
    setDragVector(new DOMVector(initialPoint.x, initialPoint.y, 0, 0));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragVector(null);
    setDragStartPoint(null);
  };

  return {
    isDragging,
    dragVector,
    handleDragStart,
    handleDragEnd,
  };
};
