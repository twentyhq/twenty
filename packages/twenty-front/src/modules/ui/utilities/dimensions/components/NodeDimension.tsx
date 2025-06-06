import { ReactNode, useEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

type NodeDimensionProps = {
  children: ReactNode;
  onDimensionChange: (dimensions: { width: number; height: number }) => void;
};

export const NodeDimension = ({
  children,
  onDimensionChange,
}: NodeDimensionProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

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
  }, [onDimensionChange]);

  return <div ref={elementRef}>{children}</div>;
};
