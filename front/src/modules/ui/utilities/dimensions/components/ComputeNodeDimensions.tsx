import { type ReactNode, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';

type ComputeNodeDimensionsEffectProps = {
  children: (
    dimensions: { height: number; width: number } | undefined,
  ) => ReactNode;
  node?: ReactNode;
};

const StyledNodeWrapper = styled.span`
  pointer-events: none;
  position: fixed;
  visibility: hidden;
`;

export const ComputeNodeDimensions = ({
  children,
  node = children(undefined),
}: ComputeNodeDimensionsEffectProps) => {
  const nodeWrapperRef = useRef<HTMLSpanElement>(null);
  const [nodeDimensions, setNodeDimensions] = useState<
    | {
        width: number;
        height: number;
      }
    | undefined
  >(undefined);

  useEffect(() => {
    nodeWrapperRef.current &&
      setNodeDimensions({
        width: nodeWrapperRef.current.offsetWidth,
        height: nodeWrapperRef.current.offsetHeight,
      });
  }, [node]);

  return (
    <>
      <StyledNodeWrapper ref={nodeWrapperRef}>{node}</StyledNodeWrapper>
      {children(nodeDimensions)}
    </>
  );
};
