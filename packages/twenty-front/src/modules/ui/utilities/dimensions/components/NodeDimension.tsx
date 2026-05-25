import { NodeDimensionEffect } from '@/ui/utilities/dimensions/components/NodeDimensionEffect';
import { type ReactNode, useRef } from 'react';

type NodeDimensionProps = {
  children: ReactNode;
  className?: string;
  onDimensionChange: (dimensions: { width: number; height: number }) => void;
};

export const NodeDimension = ({
  children,
  className,
  onDimensionChange,
}: NodeDimensionProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <NodeDimensionEffect
        elementRef={elementRef}
        onDimensionChange={onDimensionChange}
      />
      <div ref={elementRef} className={className}>
        {children}
      </div>
    </>
  );
};
