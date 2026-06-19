import { type RefObject, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

const RESIZE_THRESHOLD_PX = 1;

type ExpandableListResizeEffectProps = {
  containerRef: RefObject<HTMLElement | null>;
  onContainerWidthChange: () => void;
};

export const ExpandableListResizeEffect = ({
  containerRef,
  onContainerWidthChange,
}: ExpandableListResizeEffectProps) => {
  useEffect(() => {
    const containerElement = containerRef.current;

    if (!isDefined(containerElement)) {
      return;
    }

    let previousWidth = containerElement.clientWidth;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!isDefined(entry)) {
        return;
      }

      const newWidth = entry.contentRect.width;

      if (Math.abs(newWidth - previousWidth) > RESIZE_THRESHOLD_PX) {
        previousWidth = newWidth;
        onContainerWidthChange();
      }
    });

    resizeObserver.observe(containerElement);

    return () => resizeObserver.disconnect();
  }, [containerRef, onContainerWidthChange]);

  return null;
};
