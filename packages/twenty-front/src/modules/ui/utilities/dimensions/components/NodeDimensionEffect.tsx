import { type RefObject, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type NodeDimensionEffectProps = {
  elementRef: RefObject<HTMLElement>;
  onDimensionChange: (dimensions: { width: number; height: number }) => void;
};

export const NodeDimensionEffect = ({
  elementRef,
  onDimensionChange,
}: NodeDimensionEffectProps) => {
  useEffect(() => {
    if (!elementRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (isDefined(entry)) {
        onDimensionChange({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(elementRef.current);

    return () => resizeObserver.disconnect();
  }, [elementRef, onDimensionChange]);

  return null;
};
