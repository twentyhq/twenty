import { type RefObject, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

const RESIZE_THRESHOLD_PX = 1;

// Recompute only once the resize settles: a live drag fires continuously and each
// reset would blank the chip count until release.
const RESIZE_SETTLE_DELAY_MS = 100;

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
    let settleTimeoutId: ReturnType<typeof setTimeout> | undefined;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!isDefined(entry)) {
        return;
      }

      const newWidth = entry.contentRect.width;

      if (Math.abs(newWidth - previousWidth) <= RESIZE_THRESHOLD_PX) {
        return;
      }

      previousWidth = newWidth;
      clearTimeout(settleTimeoutId);
      settleTimeoutId = setTimeout(
        onContainerWidthChange,
        RESIZE_SETTLE_DELAY_MS,
      );
    });

    resizeObserver.observe(containerElement);

    return () => {
      clearTimeout(settleTimeoutId);
      resizeObserver.disconnect();
    };
  }, [containerRef, onContainerWidthChange]);

  return null;
};
