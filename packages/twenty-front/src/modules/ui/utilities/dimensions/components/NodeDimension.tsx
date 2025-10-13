import { NodeDimensionEffect } from '@/ui/utilities/dimensions/components/NodeDimensionEffect';
import { type ReactNode, useRef } from 'react';

type NodeDimensionProps = {
  children: ReactNode;
  onDimensionChange: (dimensions: { width: number; height: number }) => void;
};

export const NodeDimension = ({
  children,
  onDimensionChange,
}: NodeDimensionProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <NodeDimensionEffect
        elementRef={elementRef}
        onDimensionChange={onDimensionChange}
      />
      <div ref={elementRef}>{children}</div>
    </>
  );
};
