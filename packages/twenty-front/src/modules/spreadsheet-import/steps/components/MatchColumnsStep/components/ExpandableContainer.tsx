import styled from '@emotion/styled';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { ANIMATION, isDefined } from 'twenty-ui';

const StyledTransitionContainer = styled.div<{
  isExpanded: boolean;
  height: number;
}>`
  max-height: ${({ isExpanded, height }) => (isExpanded ? `${height}px` : '0')};
  overflow: hidden;
  position: relative;
  transition: max-height ${ANIMATION.duration.normal}s
    ${({ isExpanded }) => (isExpanded ? 'ease-in' : 'ease-out')};
`;

type ExpandableContainerProps = {
  isExpanded: boolean;
  children: React.ReactNode;
};

export const ExpandableContainer = ({
  isExpanded,
  children,
}: ExpandableContainerProps) => {
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isDefined(contentRef.current)) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isExpanded]);

  return (
    <StyledTransitionContainer isExpanded={isExpanded} height={contentHeight}>
      <div ref={contentRef}>{children}</div>
    </StyledTransitionContainer>
  );
};

export default ExpandableContainer;
